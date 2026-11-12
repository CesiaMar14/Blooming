import { MAX_POR_PRODUCTO } from '../config';
import { solicitar } from './http';

export const MODO_PRUEBA = false;

const PUNTOS_INICIALES_PRUEBA = 500;
const CLAVE_CUENTAS = 'blooming-cuentas-prueba';
const CLAVE_SESION = 'blooming-sesion-prueba';
const CLAVE_PEDIDOS = 'blooming-pedidos-prueba';

const CODIGOS_PRUEBA = {
  BLOOMING10: {
    tipo: 'porcentaje',
    valor: 10,
    compraMinima: 0,
  },
  BIENVENIDA: {
    tipo: 'fijo',
    valor: 5000,
    compraMinima: 30000,
  },
};

const obtenerObjetoValido = (valor) => {
  return valor &&
    typeof valor === 'object' &&
    !Array.isArray(valor)
    ? valor
    : {};
};

const obtenerProductosValidos = (pedido) => {
  if (!Array.isArray(pedido?.productos)) return [];

  return pedido.productos.filter(
    (producto) =>
      producto &&
      typeof producto === 'object' &&
      !Array.isArray(producto) &&
      (producto.id || producto.nombre)
  );
};

const numeroValido = (valor, minimo = 0) => {
  const numero = Number(valor);

  return Number.isFinite(numero) && numero >= minimo
    ? numero
    : 0;
};

const fechaValida = (valor) => {
  const fecha = new Date(valor);

  return Number.isNaN(fecha.getTime()) ? null : fecha;
};

const obtenerClaveFecha = (fecha) => {
  return [
    fecha.getFullYear(),
    String(fecha.getMonth() + 1).padStart(2, '0'),
    String(fecha.getDate()).padStart(2, '0'),
  ].join('-');
};

export function leerJSON(clave, porDefecto) {
  try {
    const contenido = localStorage.getItem(clave);

    if (contenido === null) return porDefecto;

    return JSON.parse(contenido) ?? porDefecto;
  } catch {
    return porDefecto;
  }
}

export function escribirJSON(clave, valor) {
  try {
    const contenido = JSON.stringify(valor);

    if (contenido === undefined) {
      throw new Error('Los datos no se pueden guardar.');
    }

    localStorage.setItem(clave, contenido);

    return true;
  } catch {
    throw new Error(
      'No se pudieron guardar los datos. Revisa el almacenamiento disponible en tu navegador.'
    );
  }
}

function obtenerCorreoValido(correo) {
  if (typeof correo !== 'string') {
    throw new Error('Escribe un correo electrónico válido.');
  }

  const normalizado = correo.trim().toLowerCase();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizado)) {
    throw new Error('Escribe un correo electrónico válido.');
  }

  return normalizado;
}

function obtenerDatosTelefono(whatsapp) {
  if (typeof whatsapp !== 'string') {
    throw new Error('Escribe un celular colombiano válido.');
  }

  const numero = whatsapp
    .replace(/\D/g, '')
    .replace(/^57(?=3\d{9}$)/, '');

  if (!/^3\d{9}$/.test(numero)) {
    throw new Error('Escribe un celular colombiano de 10 dígitos.');
  }

  return numero;
}

function obtenerNombreValido(nombre) {
  if (typeof nombre !== 'string' || nombre.trim().length < 3) {
    throw new Error(
      'Escribe tu nombre completo (mínimo 3 caracteres).'
    );
  }

  return nombre.trim();
}

function validarContrasena(contrasena) {
  if (
    typeof contrasena !== 'string' ||
    contrasena.length < 8
  ) {
    throw new Error(
      'La contraseña debe tener al menos 8 caracteres.'
    );
  }
}

export const API = {
  async obtenerMenu() {
    const respuesta = await solicitar('/menu');

    return respuesta.menu;
  },

  async guardarMenu(menu) {

    const token = localStorage.getItem('blooming-token');

    if (!token) {
      throw new Error('Debes iniciar sesión como administrador.');
    }

    const respuesta = await solicitar('/menu', {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(menu),
    });

    return respuesta.menu;
  },

    async obtenerLibros() {
    const respuesta = await solicitar('/libros');

    return respuesta.libros;
  },

  async guardarLibro(libro) {
    const token = localStorage.getItem('blooming-token');

    if (!token) {
      throw new Error('Debes iniciar sesión como administrador.');
    }

    const respuesta = await solicitar('/libros', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(libro),
    });

    return respuesta.libro;
  },

    async actualizarLibro(id, libro) {
    const token = localStorage.getItem('blooming-token');

    if (!token) {
      throw new Error('Debes iniciar sesión como administrador.');
    }

    const respuesta = await solicitar(
      `/libros/${encodeURIComponent(id)}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(libro),
      }
    );

    return respuesta.libro;
  },

    async obtenerEventos() {
    const respuesta = await solicitar('/eventos');

    return respuesta.eventos;
  },

  async guardarEvento(evento) {
    const token = localStorage.getItem('blooming-token');

    if (!token) {
      throw new Error('Debes iniciar sesión como administrador.');
    }

    const respuesta = await solicitar('/eventos', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(evento),
    });

    return respuesta.evento;
  },

  async actualizarEvento(id, evento) {
    const token = localStorage.getItem('blooming-token');

    if (!token) {
      throw new Error('Debes iniciar sesión como administrador.');
    }

    const respuesta = await solicitar(
      `/eventos/${encodeURIComponent(id)}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(evento),
      }
    );

    return respuesta.evento;
  },

  async clientesAdmin() {
    const respuesta = await solicitar('/auth/admin/clientes');
    const cuentas = Array.isArray(respuesta.clientes)
      ? respuesta.clientes
      : [];

    const historial = await this.pedidosAdmin();

    return cuentas.map((cuenta) => {
      const pedidosCliente = historial.filter(
        (pedido) => pedido.idCliente === cuenta.idCliente
      );

      const pedidosAprobados = pedidosCliente.filter(
        (pedido) => pedido.estado === 'APROBADO'
      );

      return {
        ...cuenta,
        totalPedidos: pedidosCliente.length,
        pedidosAprobados: pedidosAprobados.length,
        totalCompras: pedidosAprobados.reduce(
          (total, pedido) => total + numeroValido(pedido.total),
          0
        ),
      };
    });
  },

  async cuentaActual() {
    const token = localStorage.getItem('blooming-token');

    if (!token) {
      return null;
    }

    try {
      const respuesta = await solicitar('/auth/perfil');
      const cliente = respuesta.cliente;

      if (!cliente) {
        throw new Error('No fue posible validar la cuenta.');
      }

      localStorage.setItem('blooming-cliente', JSON.stringify(cliente));

      return cliente;
    } catch (error) {
      localStorage.removeItem('blooming-token');
      localStorage.removeItem('blooming-cliente');
      throw error;
    }
  },

  async iniciarSesion(datos = {}) {
    const correo = obtenerCorreoValido(datos.correo);
    const contrasena = datos.contrasena;

    if (typeof contrasena !== 'string' || !contrasena) {
      throw new Error('Escribe tu contraseña.');
    }

    const respuesta = await solicitar('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        correo,
        contrasena,
      }),
    });

    localStorage.setItem('blooming-token', respuesta.token);
    localStorage.setItem(
      'blooming-cliente',
      JSON.stringify(respuesta.cliente)
    );

    return respuesta.cliente;
  },

  async solicitarRecuperacion(correo) {
  return await solicitar('/auth/recuperar-contrasena', {
    method: 'POST',
    body: JSON.stringify({ correo }),
  });
},

  async restablecerContrasena(datos = {}) {
    return await solicitar('/auth/restablecer-contrasena', {
      method: 'POST',
      body: JSON.stringify({
        token: datos.token,
        contrasenaNueva: datos.contrasenaNueva,
      }),
    });
  },

  async crearCuenta(datos = {}) {
    const nuevoNombre = obtenerNombreValido(datos.nombre);
    const nuevoCorreo = obtenerCorreoValido(datos.correo);
    const nuevoCelular = obtenerDatosTelefono(datos.celular || datos.whatsapp);
    const contrasena = datos.contrasena;

    validarContrasena(contrasena);

    const respuesta = await solicitar('/auth/registro', {
      method: 'POST',
      body: JSON.stringify({
        nombre: nuevoNombre,
        correo: nuevoCorreo,
        celular: nuevoCelular,
        genero: datos.genero,
        fechaNacimiento: datos.fechaNacimiento || datos.nacimiento,
        contrasena,
      }),
    });

    localStorage.setItem('blooming-token', respuesta.token);
    localStorage.setItem(
      'blooming-cliente',
      JSON.stringify(respuesta.cliente)
    );

    return respuesta.cliente;
  },

  async actualizarCuenta(datos = {}) {
    const token = localStorage.getItem('blooming-token');

    if (!token) {
      throw new Error('Tu sesión terminó. Inicia sesión de nuevo.');
    }

    const respuesta = await solicitar('/auth/perfil', {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        nombre: datos.nombre,
        correo: datos.correo,
        celular: obtenerDatosTelefono(datos.celular || datos.whatsapp),
        genero: datos.genero,
        fechaNacimiento: datos.fechaNacimiento,
      }),
    });

    escribirJSON('blooming-cliente', respuesta.cliente);

    return respuesta.cliente;
  },

  async cambiarContrasena(datos = {}) {
    const token = localStorage.getItem('blooming-token');

    if (!token) {
      throw new Error('Debes iniciar sesión.');
    }

    return await solicitar('/auth/contrasena', {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        contrasenaActual: datos.contrasenaActual,
        contrasenaNueva: datos.contrasenaNueva,
      }),
    });
  },

  async eliminarCuenta(datos = {}) {
    const token = localStorage.getItem('blooming-token');

    if (!token) {
      throw new Error('No encontramos una sesión activa.');
    }

    await solicitar('/auth/perfil', {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        contrasena: datos.contrasena,
      }),
    });

    localStorage.removeItem('blooming-token');
    localStorage.removeItem('blooming-cliente');
    localStorage.removeItem(CLAVE_SESION);
  },

  async cerrarSesion() {
    try {
      localStorage.removeItem('blooming-token');
      localStorage.removeItem('blooming-cliente');
      localStorage.removeItem(CLAVE_SESION);
    } catch {
      throw new Error('No fue posible cerrar la sesión.');
    }
  },

  async validarCodigo(texto, subtotal) {
    if (typeof texto !== 'string' || !texto.trim()) {
      throw new Error('Escribe un código de descuento válido.');
    }

    const subtotalValido = Number(subtotal);

    if (!Number.isFinite(subtotalValido) || subtotalValido < 0) {
      throw new Error('El subtotal de la compra no es válido.');
    }

    const token = localStorage.getItem('blooming-token');

    if (!token) {
      throw new Error('Inicia sesión para validar un descuento.');
    }

    return await solicitar('/pedidos/validar-codigo', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        codigo: texto.trim().toUpperCase(),
        subtotal: subtotalValido,
      }),
    });
  },

  async pagar(datos = {}) {
    const carrito = datos.carrito;
    const opciones = obtenerObjetoValido(datos.opciones);

    if (!Array.isArray(carrito) || carrito.length === 0) {
      throw new Error('Tu carrito está vacío.');
    }

    const respuesta = await solicitar('/pedidos', {
      method: 'POST',
      body: JSON.stringify({
        carrito,
        opciones: {
          codigo: opciones.codigo?.codigo || opciones.codigo || '',
          usarPuntos: opciones.usarPuntos === true,
        },

      }),
    });

    return respuesta.pedido;
  },

  async simularPago(id, resultado) {
    const respuesta = await solicitar(`/pedidos/${id}/simular-pago`, {
      method: 'PATCH',
      body: JSON.stringify({ resultado }),
    });

    return respuesta.pedido;
  },

  async pedidosCliente() {
    const propia = await API.cuentaActual();

    if (!propia) return [];

    const respuesta = await solicitar('/pedidos');

    return Array.isArray(respuesta.pedidos)
      ? respuesta.pedidos.map((pedido) => ({
          ...pedido,
          fecha: pedido.createdAt || pedido.fecha,
          totalPagado: pedido.total,
        }))
      : [];
  },

  async pedidosAdmin() {
    const respuesta = await solicitar('/pedidos/admin');

    return Array.isArray(respuesta.pedidos)
    ? respuesta.pedidos.map((pedido) => ({
        ...pedido,
        idCliente: pedido.idCliente || pedido.cliente?.idCliente || '',
          fecha: pedido.createdAt || pedido.fecha,
          totalPagado: pedido.total,
          cliente: pedido.cliente || {
            nombre: 'Cliente no disponible',
            correo: '',
            whatsapp: '',
          },
        }))
      : [];
  },

  async rechazarPedido(id) {
    const respuesta = await solicitar(`/pedidos/${id}/estado`, {
      method: 'PATCH',
      body: JSON.stringify({
        estado: 'RECHAZADO',
      }),
    });

    return respuesta.pedido;
  },

  async cancelarPedido(id) {
    const respuesta = await solicitar(`/pedidos/${id}/cancelar`, {
      method: 'PATCH',
    });

    return respuesta.pedido;
  },

  async consultarIAAdmin(pregunta) {
    const respuesta = await solicitar('/ia/admin', {
      method: 'POST',
      body: JSON.stringify({ pregunta }),
    });

    return respuesta;
  },

  async resumenAdmin() {
    const [cuentas, historial] = await Promise.all([
      this.clientesAdmin(),
      this.pedidosAdmin(),
    ]);

    const ahora = new Date();

    const pedidos = historial.filter((pedido) => {
      const fecha = fechaValida(pedido?.fecha);
      const total = Number(pedido?.total);
      return pedido && pedido.estado === 'APROBADO' && fecha !== null && Number.isFinite(total) && total >= 0;
    });

    const pedidosMes = pedidos.filter((pedido) => {
      const fecha = fechaValida(pedido.fecha);
      return fecha.getFullYear() === ahora.getFullYear() && fecha.getMonth() === ahora.getMonth();
    });

    const ventasPorDia = Array.from({ length: 7 }, (_, i) => {
      const fecha = new Date(ahora);
      fecha.setHours(0, 0, 0, 0);
      fecha.setDate(fecha.getDate() - (6 - i));
      const fechaClave = obtenerClaveFecha(fecha);
      const total = pedidos
        .filter((pedido) => {
          const fechaPedido = fechaValida(pedido.fecha);
          return fechaPedido && obtenerClaveFecha(fechaPedido) === fechaClave;
        })
        .reduce((suma, pedido) => suma + numeroValido(pedido.total), 0);

      return {
        fecha: fechaClave,
        dia: fecha.toLocaleDateString('es-CO', { weekday: 'short' }),
        total,
      };
    });

    // DISTRIBUCIÓN DE EDAD Y GÉNERO
    const clientesAnalizados = cuentas.filter((cliente) => cliente.rol !== 'admin');

    const rangosEdad = [
      { rango: 'Menores de 18', minimo: 0, maximo: 17, cantidad: 0 },
      { rango: '18–24', minimo: 18, maximo: 24, cantidad: 0 },
      { rango: '25–34', minimo: 25, maximo: 34, cantidad: 0 },
      { rango: '35–44', minimo: 35, maximo: 44, cantidad: 0 },
      { rango: '45–54', minimo: 45, maximo: 54, cantidad: 0 },
      { rango: '55 o más', minimo: 55, maximo: Infinity, cantidad: 0 },
      { rango: 'Sin especificar', cantidad: 0 },
    ];

    const generos = [
      { genero: 'Femenino', cantidad: 0 },
      { genero: 'Masculino', cantidad: 0 },
      { genero: 'Otro', cantidad: 0 },
      { genero: 'Prefiero no decirlo', cantidad: 0 },
      { genero: 'Sin especificar', cantidad: 0 },
    ];

    clientesAnalizados.forEach((cliente) => {
      const nacimiento = cliente.fechaNacimiento
        ? fechaValida(cliente.fechaNacimiento)
        : null;

      if (!nacimiento || nacimiento > ahora) {
        rangosEdad[6].cantidad++;
      } else {
        let edad = ahora.getFullYear() - nacimiento.getFullYear();
        const diferenciaMes = ahora.getMonth() - nacimiento.getMonth();

        if (diferenciaMes < 0 || (diferenciaMes === 0 && ahora.getDate() < nacimiento.getDate())) edad--;

        const rango = rangosEdad.find((item) => item.minimo !== undefined && edad >= item.minimo && edad <= item.maximo);
        if (rango) rango.cantidad++;
        else rangosEdad[6].cantidad++;
      }

      const genero = {
        femenino: 'Femenino',
        masculino: 'Masculino',
        otro: 'Otro',
        prefiero_no_decir: 'Prefiero no decirlo',
      }[cliente.genero] || 'Sin especificar';

      const registroGenero = generos.find((item) => item.genero === genero);
      if (registroGenero) registroGenero.cantidad++;
    });

    // INGRESOS SEMANALES, MENSUALES Y ANUALES
    const calcularIngresosGrafica = (tipo) => {
      const periodos = [];

      if (tipo === 'semanal') {
        for (let i = 6; i >= 0; i--) {
          const fecha = new Date(ahora);
          fecha.setHours(0, 0, 0, 0);
          fecha.setDate(fecha.getDate() - i);

          periodos.push({
            clave: obtenerClaveFecha(fecha),
            periodo: fecha.toLocaleDateString('es-CO', { weekday: 'short', day: '2-digit' }),
          });
        }
      } else if (tipo === 'mensual') {
        for (let i = 11; i >= 0; i--) {
          const fecha = new Date(ahora.getFullYear(), ahora.getMonth() - i, 1);

          periodos.push({
            clave: `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`,
            periodo: fecha.toLocaleDateString('es-CO', { month: 'short', year: '2-digit' }),
          });
        }
      } else {
        for (let mes = 0; mes <= ahora.getMonth(); mes++) {
          const fecha = new Date(ahora.getFullYear(), mes, 1);

          periodos.push({
            clave: `${ahora.getFullYear()}-${String(mes + 1).padStart(2, '0')}`,
            periodo: fecha.toLocaleDateString('es-CO', { month: 'short' }),
          });
        }
      }

      return periodos.map((periodo) => ({
        periodo: periodo.periodo,
        ingresos: pedidos.reduce((total, pedido) => {
          const fecha = fechaValida(pedido.fecha);
          if (!fecha) return total;

          const clave = tipo === 'semanal'
            ? obtenerClaveFecha(fecha)
            : `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;

          return total + (clave === periodo.clave ? numeroValido(pedido.total) : 0);
        }, 0),
      }));
    };

    const ingresosSemanales = calcularIngresosGrafica('semanal');
    const ingresosMensuales = calcularIngresosGrafica('mensual');
    const ingresosAnuales = calcularIngresosGrafica('anual');

    // PRODUCTOS MÁS VENDIDOS
    const calcularProductosVendidos = (analizados) => {
      const vendidos = {};

      analizados.forEach((pedido) => {
        obtenerProductosValidos(pedido).forEach((producto) => {
          const clave = producto.id || producto.nombre;
          if (!clave) return;

          const cantidad = Number(producto.cantidad);
          const precio = Number(producto.precio);

          if (!Number.isSafeInteger(cantidad) || cantidad <= 0 || !Number.isFinite(precio) || precio < 0) return;

          if (!vendidos[clave]) {
            vendidos[clave] = {
              id: clave,
              nombre: producto.nombre || 'Producto',
              cantidad: 0,
              ingresos: 0,
            };
          }

          vendidos[clave].cantidad += cantidad;
          vendidos[clave].ingresos += precio * cantidad;
        });
      });

      return Object.values(vendidos).sort((a, b) => b.cantidad - a.cantidad).slice(0, 5);
    };

    const calcularVentasPorPeriodo = (analizados, tipo) => {
      const fechaActual = new Date();
      const periodos = [];

      if (tipo === '7') {
        for (let i = 6; i >= 0; i--) {
          const fecha = new Date(fechaActual);
          fecha.setHours(0, 0, 0, 0);
          fecha.setDate(fecha.getDate() - i);

          periodos.push({
            clave: obtenerClaveFecha(fecha),
            periodo: fecha.toLocaleDateString('es-CO', { weekday: 'short', day: '2-digit' }),
          });
        }
      } else if (tipo === 'mes') {
        for (let dia = 1; dia <= fechaActual.getDate(); dia++) {
          const fecha = new Date(fechaActual.getFullYear(), fechaActual.getMonth(), dia);
          periodos.push({ clave: obtenerClaveFecha(fecha), periodo: String(dia) });
        }
      } else {
        for (let mes = 0; mes <= fechaActual.getMonth(); mes++) {
          periodos.push({
            clave: `${fechaActual.getFullYear()}-${String(mes + 1).padStart(2, '0')}`,
            periodo: new Date(fechaActual.getFullYear(), mes, 1).toLocaleDateString('es-CO', { month: 'short' }),
          });
        }
      }

      const totales = {};

      analizados.forEach((pedido) => {
        obtenerProductosValidos(pedido).forEach((producto) => {
          const id = producto.id || producto.nombre;
          const cantidad = Number(producto.cantidad);
          if (!id || !Number.isSafeInteger(cantidad) || cantidad <= 0) return;

          if (!totales[id]) totales[id] = { id, nombre: producto.nombre || 'Producto', cantidad: 0 };
          totales[id].cantidad += cantidad;
        });
      });

      const productos = Object.values(totales).sort((a, b) => b.cantidad - a.cantidad).slice(0, 5);

      const datos = periodos.map((periodo) => {
        const fila = { periodo: periodo.periodo };
        productos.forEach((producto) => { fila[producto.id] = 0; });

        analizados.forEach((pedido) => {
          const fecha = fechaValida(pedido.fecha);
          if (!fecha) return;

          const clave = tipo === 'anio'
            ? `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`
            : obtenerClaveFecha(fecha);

          if (clave !== periodo.clave) return;

          obtenerProductosValidos(pedido).forEach((producto) => {
            const id = producto.id || producto.nombre;
            const cantidad = Number(producto.cantidad);

            if (productos.some((item) => item.id === id) && Number.isSafeInteger(cantidad) && cantidad > 0) {
              fila[id] += cantidad;
            }
          });
        });

        return fila;
      });

      return { productos, datos };
    };

    const pedidosAnio = pedidos.filter((pedido) => {
      const fecha = fechaValida(pedido.fecha);
      return fecha && fecha.getFullYear() === ahora.getFullYear();
    });

    const inicioUltimos7Dias = new Date(ahora);
    inicioUltimos7Dias.setHours(0, 0, 0, 0);
    inicioUltimos7Dias.setDate(inicioUltimos7Dias.getDate() - 6);

    const pedidosUltimos7Dias = pedidos.filter((pedido) => {
      const fecha = fechaValida(pedido.fecha);
      return fecha && fecha >= inicioUltimos7Dias && fecha <= ahora;
    });

    const productosMasVendidos = calcularProductosVendidos(pedidosAnio);
    const productosMasVendidosMes = calcularProductosVendidos(pedidosMes);
    const productosMasVendidos7Dias = calcularProductosVendidos(pedidosUltimos7Dias);

    const ventasProductos7Dias = calcularVentasPorPeriodo(pedidosUltimos7Dias, '7');
    const ventasProductosMes = calcularVentasPorPeriodo(pedidosMes, 'mes');
    const ventasProductosAnio = calcularVentasPorPeriodo(pedidosAnio, 'anio');

    const pedidosRecientes = [...historial]
      .sort((a, b) => {
        const fechaA = fechaValida(a.fecha)?.getTime() || 0;
        const fechaB = fechaValida(b.fecha)?.getTime() || 0;
        return fechaB - fechaA;
      })
      .slice(0, 5)
      .map((pedido) => ({
        referencia: pedido.referencia || pedido.id || '—',
        fecha: pedido.fecha,
        cliente: pedido.cliente?.nombre || 'Cliente',
        totalPagado: numeroValido(pedido.total),
        estado: pedido.estado || 'Sin estado',
      }));

    return {
      clientes: cuentas.length,
      pedidos: pedidos.length,
      pedidosMes: pedidosMes.length,
      ingresos: pedidos.reduce((total, pedido) => total + numeroValido(pedido.total), 0),
      puntosRedimidos: pedidos.reduce((total, pedido) => total + numeroValido(pedido.puntosUsados), 0),
      distribucionEdad: rangosEdad,
      distribucionGenero: generos,
      ingresosSemanales,
      ingresosMensuales,
      ingresosAnuales,
      productosMasVendidos,
      productosMasVendidosMes,
      productosMasVendidos7Dias,
      ventasProductos7Dias,
      ventasProductosMes,
      ventasProductosAnio,
      ventasPorDia,
      pedidosRecientes,
    };
  },
};