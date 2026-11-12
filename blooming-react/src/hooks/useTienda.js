import { useEffect, useMemo, useState } from 'react';
import { API, leerJSON, escribirJSON } from '../services/api';
import { calcularResumen } from '../utils/resumen';
import { MAX_POR_PRODUCTO } from '../config';

const CLAVE_CARRITO = 'blooming-carrito';
const CLAVE_OPCIONES = 'blooming-carrito-opciones';

const esProductoValido = (p) =>
  p &&
  typeof p.id === 'string' &&
  typeof p.nombre === 'string' &&
  Number.isFinite(p.precio) &&
  p.precio >= 0 &&
  Number.isInteger(p.cantidad) &&
  p.cantidad > 0 &&
  p.cantidad <= MAX_POR_PRODUCTO;

function cargarCarrito() {
  const guardado = leerJSON(CLAVE_CARRITO, []);
  return Array.isArray(guardado) ? guardado.filter(esProductoValido) : [];
}

function cargarOpciones() {
  const guardado = leerJSON(CLAVE_OPCIONES, {});
  const c = guardado.codigo;
  const codigoValido = c && typeof c.codigo === 'string' && (c.tipo === 'porcentaje' || c.tipo === 'fijo') && Number.isFinite(c.valor) && Number.isFinite(c.compraMinima);
  return { codigo: codigoValido ? c : null, usarPuntos: guardado.usarPuntos === true };
}

export function useTienda() {
  const [carrito, setCarrito] = useState(cargarCarrito);
  const [opciones, setOpciones] = useState(cargarOpciones);
  const [cuenta, setCuenta] = useState(null);

  useEffect(() => { escribirJSON(CLAVE_CARRITO, carrito); }, [carrito]);
  useEffect(() => { escribirJSON(CLAVE_OPCIONES, opciones); }, [opciones]);

  useEffect(() => {
    const cargarCuenta = () => API.cuentaActual().then(setCuenta).catch(() => setCuenta(null));
    cargarCuenta();

    const alCambiar = (e) => {
      if (e.key !== null && !e.key.startsWith('blooming-')) return;
      setCarrito(cargarCarrito());
      setOpciones(cargarOpciones());
      cargarCuenta();
    };

    window.addEventListener('storage', alCambiar);
    return () => window.removeEventListener('storage', alCambiar);
  }, []);

  const resumen = useMemo(
    () => calcularResumen({ carrito, opciones, saldo: cuenta ? cuenta.puntos : 0 }),
    [carrito, opciones, cuenta]
  );

  const unidades = carrito.reduce((s, p) => s + p.cantidad, 0);

  // producto = { id, nombre, detalle, precio }
  const agregar = (producto) =>
    setCarrito((actual) => {
      const limite = Number.isFinite(producto.stockDisponible) ? Math.min(producto.stockDisponible, MAX_POR_PRODUCTO) : MAX_POR_PRODUCTO;
      if (limite <= 0) {
        window.alert('Este producto está agotado.');
        return actual;
      }
      const existe = actual.find((p) => p.id === producto.id);
      if (existe) {
        return actual.map((p) => p.id === producto.id ? { ...p, ...producto, cantidad: Math.min(p.cantidad + 1, limite) } : p);
      }
      return [...actual, { ...producto, cantidad: 1 }];
    });

  const cambiarCantidad = (id, cambio) =>
    setCarrito((actual) =>
      actual.map((p) => p.id === id ? { ...p, cantidad: Math.min(Math.max(p.cantidad + cambio, 1), Number.isFinite(p.stockDisponible) ? Math.min(p.stockDisponible, MAX_POR_PRODUCTO) : MAX_POR_PRODUCTO) } : p)
    );

  const quitar = (id) => setCarrito((actual) => actual.filter((p) => p.id !== id));

  const aplicarCodigo = async (texto) => {
    const codigo = await API.validarCodigo(texto, resumen.subtotal);
    setOpciones((o) => ({ ...o, codigo }));
  };

  const quitarCodigo = () => setOpciones((o) => ({ ...o, codigo: null }));
  const usarPuntos = (valor) => setOpciones((o) => ({ ...o, usarPuntos: valor }));

  const iniciarSesion = async (datos) => setCuenta(await API.iniciarSesion(datos));
  const crearCuenta = async (datos) => setCuenta(await API.crearCuenta(datos));

  const cerrarSesion = async () => {
    await API.cerrarSesion();
    setCuenta(null);
  };

  const actualizarCuenta = async (datos) => {
    const cuentaActualizada = await API.actualizarCuenta(datos);
    setCuenta(cuentaActualizada);
    return cuentaActualizada;
  };

  const refrescarCuenta = async () => {
  const cuentaActualizada = await API.cuentaActual();
  setCuenta(cuentaActualizada);
  return cuentaActualizada;
};

  const eliminarCuenta = async (contrasena) => {
    await API.eliminarCuenta({ contrasena });
    setCuenta(null);
  };


  const pagar = async () => {
    const respuesta = await API.pagar({ resumen, carrito, opciones });

    // El pedido queda pendiente, pero ya fue registrado correctamente.
    setCarrito([]);
    setOpciones({ codigo: null, usarPuntos: false });

    return respuesta;
  };


  return {
    carrito, opciones, cuenta, resumen, unidades,
    agregar, cambiarCantidad, quitar,
    aplicarCodigo, quitarCodigo, usarPuntos,
    iniciarSesion, crearCuenta, cerrarSesion, pagar,
    actualizarCuenta, refrescarCuenta, eliminarCuenta,
    pedidosCliente: () => API.pedidosCliente(),
  };
}