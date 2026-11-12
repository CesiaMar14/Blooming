
const express = require('express');
const { randomUUID } = require('crypto');

const Pedido = require('../models/Pedido');
const Cliente = require('../models/Cliente');
const Libro = require('../models/Libro');
const Evento = require('../models/Evento');
const verificarToken = require('../middleware/auth');
const { verificarAdmin } = require('../middleware/auth');

const router = express.Router();

const EXTRA_CAJITA = 45000;
const MAX_POR_PRODUCTO = 20;
const PESOS_POR_PUNTO_GANADO = 1000;
const VALOR_PUNTO = 20;
const TOPE_PORCENTAJE = 60;
const MINIMO_CANJE = 100;

const CODIGOS_DESCUENTO = {
  BLOOMING10: { tipo: 'porcentaje', valor: 10, compraMinima: 0 },
  BIENVENIDA: { tipo: 'fijo', valor: 5000, compraMinima: 30000 },
};

function eventoFinalizado(evento) {
  const fechaFin = new Date(`${evento.fecha}T${evento.hora ? `${evento.hora}:00` : '23:59:59'}-05:00`);
  return Number.isNaN(fechaFin.getTime()) || Date.now() >= fechaFin.getTime();
}

// Devolver inventario
async function devolverInventario(productos) {
  for (const producto of productos) {
    await Libro.updateOne(
      { id: producto.id },
      { $inc: { [producto.campo]: producto.cantidad } }
    );
  }
}

// Descontar inventario de libros y cajitas
async function descontarInventario(productos) {
  const descontados = [];

  try {
    for (const producto of productos) {
      if (!['libro', 'cajita'].includes(producto.tipo)) continue;

      const idLibro = producto.id.replace(/^(libro|cajita)-/, '');
      const campo = producto.tipo === 'cajita' ? 'stockCajita' : 'stockLibro';

      const resultado = await Libro.updateOne(
        { id: idLibro, activo: true, [campo]: { $gte: producto.cantidad } },
        { $inc: { [campo]: -producto.cantidad } }
      );

      if (resultado.modifiedCount !== 1) {
        throw new Error(`No hay suficientes unidades de ${producto.nombre}.`);
      }

      descontados.push({ id: idLibro, campo, cantidad: producto.cantidad });
    }

    return descontados;
  } catch (error) {
    await devolverInventario(descontados);
    throw error;
  }
}

// Validar código de descuento
router.post('/validar-codigo', verificarToken, async (req, res) => {
  try {
    const { codigo: codigoRecibido, subtotal } = req.body;
    const codigo = String(codigoRecibido || '').trim().toUpperCase();
    const subtotalValido = Number(subtotal);

    if (!codigo || !Number.isFinite(subtotalValido) || subtotalValido < 0) {
      return res.status(400).json({ mensaje: 'Los datos del descuento no son válidos.' });
    }

    const regla = CODIGOS_DESCUENTO[codigo];

    if (!regla) return res.status(400).json({ mensaje: 'El código de descuento no es válido.' });

    if (subtotalValido < regla.compraMinima) {
      return res.status(400).json({ mensaje: `Este código aplica en compras desde $${regla.compraMinima.toLocaleString('es-CO')}.` });
    }

    return res.json({ codigo, ...regla });
  } catch (error) {
    console.error('Error al validar descuento:', error.message);
    return res.status(500).json({ mensaje: 'No fue posible validar el descuento.' });
  }
});

// Rechazar un pedido pendiente (solo administrador)
router.patch('/:id/estado', verificarToken, verificarAdmin, async (req, res) => {
  try {
    if (!/^[a-f\d]{24}$/i.test(req.params.id)) {
      return res.status(400).json({ mensaje: 'El identificador del pedido no es válido.' });
    }

    if (req.body.estado !== 'RECHAZADO') {
      return res.status(400).json({ mensaje: 'Solo se permite rechazar pedidos desde esta ruta.' });
    }

    const pedido = await Pedido.findOneAndUpdate(
      { _id: req.params.id, estado: 'PENDIENTE', puntosDevueltos: { $ne: true } },
      { $set: { estado: 'RECHAZADO', puntosDevueltos: true } },
      { new: true, runValidators: true }
    );

    if (!pedido) {
      return res.status(404).json({ mensaje: 'Pedido no encontrado o ya no está pendiente.' });
    }

    if (pedido.puntosUsados > 0) {
      const resultado = await Cliente.updateOne(
        { _id: pedido.cliente },
        { $inc: { puntos: pedido.puntosUsados } }
      );

      if (resultado.matchedCount !== 1) throw new Error('No se pudo devolver los puntos al cliente.');
    }

    return res.json({ mensaje: 'Pedido rechazado y puntos devueltos correctamente.', pedido });
  } catch (error) {
    console.error('Error al rechazar pedido:', error.message);
    return res.status(500).json({ mensaje: 'No fue posible rechazar el pedido.' });
  }
});

// Consultar todos los pedidos (solo administrador)
router.get('/admin', verificarToken, verificarAdmin, async (req, res) => {
  try {
    const pedidos = await Pedido.find()
      .populate('cliente', 'idCliente nombre correo whatsapp celular')
      .sort({ createdAt: -1 });

    return res.json({ pedidos });
  } catch (error) {
    console.error('Error al consultar pedidos administrativos:', error.message);
    return res.status(500).json({ mensaje: 'Error al consultar los pedidos.' });
  }
});

// Cancelar un pedido pendiente (solo su propietario)
router.patch('/:id/cancelar', verificarToken, async (req, res) => {
  try {
    if (!/^[a-f\d]{24}$/i.test(req.params.id)) {
      return res.status(400).json({ mensaje: 'El identificador del pedido no es válido.' });
    }

    const pedido = await Pedido.findOneAndUpdate(
      { _id: req.params.id, cliente: req.clienteId, estado: 'PENDIENTE', puntosDevueltos: { $ne: true } },
      { $set: { estado: 'CANCELADO', puntosDevueltos: true } },
      { new: true, runValidators: true }
    );

    if (!pedido) {
      return res.status(404).json({ mensaje: 'Pedido no encontrado o ya no está pendiente.' });
    }

    if (pedido.puntosUsados > 0) {
      const resultado = await Cliente.updateOne(
        { _id: req.clienteId },
        { $inc: { puntos: pedido.puntosUsados } }
      );

      if (resultado.matchedCount !== 1) throw new Error('No se pudieron devolver los puntos al cliente.');
    }

    return res.json({ mensaje: 'Pedido cancelado y puntos devueltos correctamente.', pedido });
  } catch (error) {
    console.error('Error al cancelar pedido:', error.message);
    return res.status(500).json({ mensaje: 'No fue posible cancelar el pedido.' });
  }
});

// Consultar pedidos del cliente
router.get('/', verificarToken, async (req, res) => {
  try {
    const pedidos = await Pedido.find({ cliente: req.clienteId }).sort({ createdAt: -1 });
    return res.json({ pedidos });
  } catch (error) {
    console.error('Error al consultar pedidos:', error.message);
    return res.status(500).json({ mensaje: 'Error al consultar los pedidos.' });
  }
});

// Crear pedido
router.post('/', verificarToken, async (req, res) => {
  try {
    const cliente = await Cliente.findById(req.clienteId);

    if (!cliente) return res.status(404).json({ mensaje: 'Cliente no encontrado.' });

    const { carrito, opciones = {} } = req.body;

    if (!Array.isArray(carrito) || carrito.length === 0 || carrito.length > 50) {
      return res.status(400).json({ mensaje: 'El carrito no es válido.' });
    }

    const productos = [];
    const cantidadesEventos = {};
    let subtotal = 0;

    for (const producto of carrito) {
      if (!producto || typeof producto.id !== 'string' || !Number.isInteger(producto.cantidad) || producto.cantidad < 1 || producto.cantidad > MAX_POR_PRODUCTO) {
        return res.status(400).json({ mensaje: 'Hay un producto con datos inválidos.' });
      }

      const id = producto.id.trim();

      // Libros y cajitas literarias
      if (/^(libro|cajita)-/.test(id)) {
        const esCajita = id.startsWith('cajita-');
        const idLibro = id.replace(/^(libro|cajita)-/, '');
        const libro = await Libro.findOne({ id: idLibro, activo: true });

        if (!libro) return res.status(400).json({ mensaje: 'Uno de los libros ya no está disponible.' });

        const campoStock = esCajita ? 'stockCajita' : 'stockLibro';
        if (libro[campoStock] < producto.cantidad) {
          return res.status(400).json({ mensaje: `No hay suficientes unidades de ${libro.titulo}. Disponibles: ${libro[campoStock]}.` });
        }

        const precio = Number(libro.precio) + (esCajita ? EXTRA_CAJITA : 0);

        productos.push({
          id,
          nombre: libro.titulo,
          detalle: esCajita ? 'Con cajita literaria' : 'Solo el libro',
          cantidad: producto.cantidad,
          precio,
          tipo: esCajita ? 'cajita' : 'libro',
        });

        subtotal += precio * producto.cantidad;
        continue;
      }

      // Eventos y clubes de lectura
      if (typeof producto.eventoId !== 'string') {
        return res.status(400).json({ mensaje: 'El producto enviado no es válido.' });
      }

      const evento = await Evento.findOne({ id: producto.eventoId, activo: true });

      if (!evento) return res.status(400).json({ mensaje: 'Uno de los eventos ya no está disponible.' });

      if (eventoFinalizado(evento)) return res.status(400).json({ mensaje: 'El evento ya finalizó y no admite nuevas compras.' });

      const idEsperado = evento.tipo === 'club' ? `club-${evento.fecha}` : `evento-${evento.fecha}`;

      if (id !== idEsperado) return res.status(400).json({ mensaje: 'La información del evento no coincide.' });

      cantidadesEventos[evento.id] = (cantidadesEventos[evento.id] || 0) + producto.cantidad;

      if (cantidadesEventos[evento.id] > evento.cupos) {
        return res.status(400).json({ mensaje: `No hay suficientes cupos para ${evento.titulo}.` });
      }

      const precio = Number(evento.precio);

      productos.push({
        id: idEsperado,
        nombre: evento.titulo,
        detalle: evento.tipo === 'club' ? 'Club de lectura' : 'Evento',
        cantidad: producto.cantidad,
        precio,
        tipo: 'evento',
        eventoId: evento.id,
        fechaEvento: evento.fecha,
        horaEvento: evento.hora || '',
        lugarEvento: evento.lugar || '',
        tituloEvento: evento.titulo,
      });

      subtotal += precio * producto.cantidad;
    }

    // Validar descuento
    const codigoRecibido = typeof opciones.codigo === 'string' ? opciones.codigo : opciones.codigo?.codigo;
    const codigo = String(codigoRecibido || '').trim().toUpperCase();
    const regla = codigo ? CODIGOS_DESCUENTO[codigo] : null;

    if (codigo && !regla) return res.status(400).json({ mensaje: 'El código de descuento no es válido.' });

    if (regla && subtotal < regla.compraMinima) {
      return res.status(400).json({ mensaje: 'No cumples el valor mínimo para usar este código.' });
    }

    let descuentoCodigo = 0;

    if (regla) {
      descuentoCodigo = regla.tipo === 'porcentaje' ? Math.round(subtotal * regla.valor / 100) : regla.valor;
      descuentoCodigo = Math.min(descuentoCodigo, subtotal);
    }

    // Calcular puntos
    const restante = subtotal - descuentoCodigo;
    const maximoPorTope = Math.floor(restante * TOPE_PORCENTAJE / (100 * VALOR_PUNTO));
    const puntosUsables = Math.min(cliente.puntos, maximoPorTope);
    const puntosUsados = opciones.usarPuntos === true && puntosUsables >= MINIMO_CANJE ? puntosUsables : 0;
    const descuentoPuntos = puntosUsados * VALOR_PUNTO;
    const total = restante - descuentoPuntos;
    const puntosGanados = Math.floor(total / PESOS_POR_PUNTO_GANADO);

    // Descontar puntos de forma atómica
    if (puntosUsados > 0) {
      const clienteActualizado = await Cliente.findOneAndUpdate(
        { _id: cliente._id, puntos: { $gte: puntosUsados } },
        { $inc: { puntos: -puntosUsados } },
        { new: true }
      );

      if (!clienteActualizado) return res.status(400).json({ mensaje: 'No tienes suficientes puntos disponibles.' });
    }

    // Crear pedido pendiente
    let pedido;

    try {
      pedido = await Pedido.create({
        referencia: `BL-${randomUUID()}`,
        cliente: cliente._id,
        idCliente: cliente.idCliente,
        productos,
        subtotal,
        codigoDescuento: regla ? codigo : '',
        descuentoCodigo,
        puntosUsados,
        descuentoPuntos,
        puntosGanados,
        total,
        estado: 'PENDIENTE',
      });
    } catch (error) {
      if (puntosUsados > 0) await Cliente.updateOne({ _id: cliente._id }, { $inc: { puntos: puntosUsados } });
      throw error;
    }

    return res.status(201).json({ mensaje: 'Pedido creado correctamente.', pedido });
  } catch (error) {
    console.error('Error al crear pedido:', error.message);
    return res.status(500).json({ mensaje: 'No fue posible crear el pedido.' });
  }
});

// Simular el resultado del pago del cliente
router.patch('/:id/simular-pago', verificarToken, async (req, res) => {
  let pedido;
  let estadoFinal;
  let campoControl;
  let inventarioDescontado = [];

  try {
    if (!/^[a-f\d]{24}$/i.test(req.params.id)) {
      return res.status(400).json({ mensaje: 'El identificador del pedido no es válido.' });
    }

    const resultado = req.body.resultado;

    if (!['APROBADO', 'RECHAZADO'].includes(resultado)) {
      return res.status(400).json({ mensaje: 'El resultado debe ser APROBADO o RECHAZADO.' });
    }

    const aprobado = resultado === 'APROBADO';
    estadoFinal = aprobado ? 'APROBADO' : 'RECHAZADO';
    campoControl = aprobado ? 'puntosAcreditados' : 'puntosDevueltos';

    pedido = await Pedido.findOneAndUpdate(
      { _id: req.params.id, cliente: req.clienteId, estado: 'PENDIENTE', [campoControl]: { $ne: true } },
      { $set: { estado: estadoFinal, [campoControl]: true } },
      { new: true, runValidators: true }
    );

    if (!pedido) return res.status(404).json({ mensaje: 'Pedido no encontrado o ya no está pendiente.' });

    // Descontar inventario únicamente cuando el pago es aprobado
    if (aprobado) inventarioDescontado = await descontarInventario(pedido.productos);

    const cantidadPuntos = aprobado ? pedido.puntosGanados : pedido.puntosUsados;

    if (cantidadPuntos > 0) {
      const actualizacion = await Cliente.updateOne(
        { _id: req.clienteId },
        { $inc: { puntos: cantidadPuntos } }
      );

      if (actualizacion.matchedCount !== 1) throw new Error('No se pudieron actualizar los puntos del cliente.');
    }

    return res.json({
      mensaje: aprobado ? 'Pago simulado exitosamente. Inventario actualizado y puntos acreditados.' : 'Pago rechazado. Puntos utilizados devueltos.',
      pedido,
    });
  } catch (error) {
    if (inventarioDescontado.length) {
      try {
        await devolverInventario(inventarioDescontado);
      } catch (errorInventario) {
        console.error('Error al devolver inventario:', errorInventario.message);
      }
    }

    if (pedido) {
      await Pedido.updateOne(
        { _id: pedido._id, estado: estadoFinal, [campoControl]: true },
        { $set: { estado: 'PENDIENTE', [campoControl]: false } }
      );
    }

    console.error('Error al simular pago:', error.message);

    const sinStock = error.message.startsWith('No hay suficientes unidades');
    return res.status(sinStock ? 400 : 500).json({
      mensaje: sinStock ? error.message : 'No fue posible procesar el pago.',
    });
  }
});

module.exports = router;