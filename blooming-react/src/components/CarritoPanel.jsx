import { useCallback, useEffect, useRef, useState } from 'react';
import { formatoPrecio } from '../data/menu';
import { MAX_POR_PRODUCTO, MINIMO_CANJE, TOPE_PORCENTAJE, VALOR_PUNTO } from '../config';
import { API } from '../services/api';

function CarritoPanel({ abierto, onCerrar, tienda, onPedirCuenta }) {
  const {
    carrito, opciones, cuenta, resumen: r,
    cambiarCantidad, quitar, aplicarCodigo, quitarCodigo, usarPuntos, pagar,
  } = tienda;

  const [campoCodigo, setCampoCodigo] = useState('');
  const [msgCodigo, setMsgCodigo] = useState({ texto: '', tipo: 'info' });
  const [confirmacion, setConfirmacion] = useState(null);
  const [pedidoPendiente, setPedidoPendiente] = useState(null);
  const [procesando, setProcesando] = useState(false);
  const cerrarRef = useRef(null);

  const cerrar = useCallback(() => {
    setConfirmacion(null);
    onCerrar();
  }, [onCerrar]);

  const finalizar = useCallback(async () => {
    if (carrito.length === 0 || procesando) return;

    if (!cuenta) {
    onPedirCuenta({
      aviso: 'Para pagar necesitas una cuenta. Inicia sesión o créala en un momento.',
    });
    return;
  }

  setProcesando(true);
    try {
      const respuesta = await pagar();
      setPedidoPendiente(respuesta);
      if (respuesta.urlPago) return;

      await tienda.refrescarCuenta();

      setMsgCodigo({ texto: '', tipo: 'info' });
      setCampoCodigo('');
      setConfirmacion({
        tipo: 'ok',
        texto: `Pedido creado correctamente. Pago pendiente de confirmación. Total: ${formatoPrecio(respuesta.total)}. Referencia ${respuesta.referencia}.`,
      });
    } catch (error) {
      setConfirmacion({ tipo: 'error', texto: error.message });
    } finally {
      setProcesando(false);
    }
  }, [carrito.length, procesando, cuenta, onPedirCuenta, pagar, tienda]);

  const procesarPago = useCallback(async (resultado) => {
    if (!pedidoPendiente?._id || procesando) return;

    setProcesando(true);

    try {
      await API.simularPago(pedidoPendiente._id, resultado);
      await tienda.refrescarCuenta();

      setPedidoPendiente(null);
      setConfirmacion({
        tipo: resultado === 'APROBADO' ? 'ok' : 'error',
        texto: resultado === 'APROBADO'
          ? '¡Pago aprobado! Tu pedido está confirmado y tus puntos fueron acreditados.'
          : 'Pago rechazado. Tu pedido no fue aprobado y tus puntos fueron devueltos.',
      });
    } catch (error) {
      setConfirmacion({
        tipo: 'error',
        texto: error.message || 'No se pudo procesar el pago.',
      });
    } finally {
      setProcesando(false);
    }
  }, [pedidoPendiente, procesando, tienda]);

  // Foco en la X al abrir y Escape para cerrar
  useEffect(() => {
    if (!abierto) return;
    cerrarRef.current?.focus();
    const alTeclear = (e) => {
      if (e.key !== 'Escape') return;
      if (document.querySelector('dialog[open]')) return; // Esc es para el diálogo
      cerrar();
    };
    document.addEventListener('keydown', alTeclear);
    return () => document.removeEventListener('keydown', alTeclear);
  }, [abierto, cerrar]);

  // Si el pedido ya no cumple la compra mínima, se quita el código
  useEffect(() => {
    if (opciones.codigo && r.subtotal < opciones.codigo.compraMinima) {
      quitarCodigo();
    }
  }, [r.subtotal, opciones.codigo, quitarCodigo]);

  function modificarCarrito(accion, ...args) {
    setConfirmacion(null);
    accion(...args);
  }

  async function enviarCodigo(e) {
    e.preventDefault();

    if (opciones.codigo) {
      quitarCodigo();
      setCampoCodigo('');
      setMsgCodigo({ texto: '', tipo: 'info' });
      return;
    }
    if (!campoCodigo.trim()) {
      setMsgCodigo({ texto: 'Escribe tu código.', tipo: 'error' });
      return;
    }
    if (carrito.length === 0) {
      setMsgCodigo({ texto: 'Agrega productos antes de aplicar un código.', tipo: 'error' });
      return;
    }
    try {
      await aplicarCodigo(campoCodigo);
      setMsgCodigo({ texto: 'Código aplicado.', tipo: 'ok' });
    } catch (error) {
      setMsgCodigo({ texto: error.message, tipo: 'error' });
    }
  }

  // Mensaje bajo la casilla de puntos
  let msgPuntos;
  if (!cuenta) msgPuntos = 'Inicia sesión para ver y usar tus puntos.';
  else if (r.subtotal === 0) msgPuntos = `Tienes ${r.saldo} puntos.`;
  else if (r.saldo < MINIMO_CANJE) msgPuntos = `Necesitas mínimo ${MINIMO_CANJE} puntos para canjear. Tienes ${r.saldo}.`;
  else if (!r.puedeCanjear) msgPuntos = `Con este pedido solo puedes canjear ${r.puntosUsables} puntos, menos del mínimo de ${MINIMO_CANJE}.`;
  else msgPuntos = `Tienes ${r.saldo} puntos. Cubren hasta el ${TOPE_PORCENTAJE}% de lo que queda del pedido.`;

  let ganancia = '';
  if (r.subtotal > 0 && r.puntosGanados > 0) {
    ganancia = cuenta
    ? `Con este pedido ganarás ${r.puntosGanados} puntos.`
    : `Inicia sesión y gana ${r.puntosGanados} puntos con este pedido.`;
  }

  return (
    <>
      <div className={`carrito-overlay ${abierto ? 'abierto' : ''}`} onClick={cerrar}></div>

      <aside
        className={`carrito-panel ${abierto ? 'abierto' : ''}`}
        id="carrito-panel"
        aria-hidden={!abierto}
      >
        <div className="carrito-panel-header">
          <h2 className="carrito-titulo">Tu pedido</h2>
          <button ref={cerrarRef} type="button" className="carrito-cerrar" aria-label="Cerrar carrito" onClick={cerrar}>
            <i className="ti ti-x" aria-hidden="true"></i>
          </button>
        </div>

        {confirmacion && (
          <p className="carrito-confirmacion" role="status" data-tipo={confirmacion.tipo}>
            {confirmacion.texto}
          </p>
        )}

        <div className="carrito-items">
          {carrito.length === 0 ? (
            <p className="carrito-vacio">Tu carrito está vacío.</p>
          ) : (
            carrito.map((p) => {
              const nombreCompleto = p.detalle ? `${p.nombre}, ${p.detalle}` : p.nombre;
              return (
                <article className="carrito-item" key={p.id}>
                  <div className="carrito-item-info">
                    <p className="carrito-item-nombre">{p.nombre}</p>
                    {p.detalle && <p className="carrito-item-detalle">{p.detalle}</p>}
                    <p className="carrito-item-precio">{formatoPrecio(p.precio * p.cantidad)}</p>
                  </div>

                  <div className="carrito-item-cantidad">
                    <button
                      type="button"
                      className="carrito-menos"
                      aria-label={`Quitar una unidad de ${nombreCompleto}`}
                      disabled={p.cantidad <= 1}
                      onClick={() => modificarCarrito(cambiarCantidad, p.id, -1)}

                    >
                      <i className="ti ti-minus" aria-hidden="true"></i>
                    </button>
                    <span className="carrito-cantidad">{p.cantidad}</span>
                    <button
                      type="button"
                      className="carrito-mas"
                      aria-label={`Agregar una unidad de ${nombreCompleto}`}
                      disabled={p.cantidad >= MAX_POR_PRODUCTO}
                      onClick={() => modificarCarrito(cambiarCantidad, p.id, 1)}
                    >
                      <i className="ti ti-plus" aria-hidden="true"></i>
                    </button>
                  </div>

                  <button
                    type="button"
                    className="carrito-quitar"
                    aria-label={`Quitar ${nombreCompleto} del pedido`}
                    onClick={() => modificarCarrito(quitar, p.id)}
                  >
                    <i className="ti ti-trash" aria-hidden="true"></i>
                  </button>
                </article>
              );
            })
          )}
        </div>

        <div className="carrito-panel-footer">
          <form className="carrito-codigo" onSubmit={enviarCodigo} noValidate>
            <label htmlFor="carrito-codigo-campo">Código de descuento</label>
            <div className="carrito-codigo-fila">
              <input
                type="text"
                id="carrito-codigo-campo"
                autoComplete="off"
                spellCheck="false"
                aria-describedby="carrito-codigo-mensaje"
                value={opciones.codigo ? opciones.codigo.codigo : campoCodigo}
                readOnly={Boolean(opciones.codigo)}
                onChange={(e) => setCampoCodigo(e.target.value)}
              />
              <button type="submit" className="carrito-codigo-boton">
                {opciones.codigo ? 'Quitar' : 'Aplicar'}
              </button>
            </div>
            <p className="carrito-mensaje" id="carrito-codigo-mensaje" role="status" data-tipo={msgCodigo.tipo}>
              {msgCodigo.texto}
            </p>
          </form>

          <div className="carrito-puntos">
            <label className="carrito-puntos-opcion">
              <input
                type="checkbox"
                checked={r.puntosUsados > 0}
                disabled={!r.puedeCanjear}
                onChange={(e) => usarPuntos(e.target.checked)}
              />
              <span>
                {r.puedeCanjear
                  ? `Usar ${r.puntosUsables} puntos (−${formatoPrecio(r.puntosUsables * VALOR_PUNTO)})`
                  : 'Usar mis puntos'}
              </span>
            </label>
            <p className="carrito-mensaje" role="status">{msgPuntos}</p>
          </div>

          <div className="carrito-resumen">
            <p className="carrito-resumen-fila"><span>Subtotal</span><span>{formatoPrecio(r.subtotal)}</span></p>
            {r.descuentoCodigo > 0 && (
              <p className="carrito-resumen-fila">
                <span>Código {opciones.codigo?.codigo}</span>
                <span>−{formatoPrecio(r.descuentoCodigo)}</span>
              </p>
            )}
            {r.puntosUsados > 0 && (
              <p className="carrito-resumen-fila">
                <span>{r.puntosUsados} puntos</span>
                <span>−{formatoPrecio(r.descuentoPuntos)}</span>
              </p>
            )}
            <p className="carrito-resumen-fila carrito-total">
              <span>Total</span>
              <span className="carrito-total-monto">{formatoPrecio(r.total)}</span>
            </p>
          </div>

          <p className="carrito-ganancia">{ganancia}</p>
                    <button
            type="button"
            className="carrito-checkout"
            disabled={carrito.length === 0 || procesando || !!pedidoPendiente}
            onClick={finalizar}
          >
            {procesando ? 'Procesando…' : 'Finalizar pedido'}
          </button>

          {pedidoPendiente && (
            <div className="carrito-pago-simulado">
              <p>Selecciona el resultado del pago:</p>

              <button
                type="button"
                disabled={procesando}
                onClick={() => procesarPago('APROBADO')}
              >
                {procesando ? 'Procesando…' : 'Simular pago aprobado'}
              </button>

              <button
                type="button"
                disabled={procesando}
                onClick={() => procesarPago('RECHAZADO')}
              >
                Simular pago rechazado
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

export default CarritoPanel;