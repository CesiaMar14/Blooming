import { useEffect, useState } from 'react';
import { API } from '../services/api';
import { VALOR_PUNTO } from '../config';
import { formatoPrecio } from '../data/menu';
import { QRCodeSVG } from 'qrcode.react';

const SECCIONES = [
  { id: 'resumen', nombre: 'Resumen', icono: 'ti-layout-dashboard' },
  { id: 'perfil', nombre: 'Mi perfil', icono: 'ti-user' },
  { id: 'pedidos', nombre: 'Mis pedidos', icono: 'ti-shopping-bag' },
  { id: 'puntos', nombre: 'Mis puntos', icono: 'ti-award' },
  { id: 'eventos', nombre: 'Mis eventos', icono: 'ti-calendar-event' },
  { id: 'configuracion', nombre: 'Configuración', icono: 'ti-settings' },
];

// BL-6004598D-2A27-4CBC-965B-0FA23E545ECA → BL-0FA23E545ECA (solo visual)
const referenciaCorta = (ref) => {
  const partes = ref.split('-');
  return partes.length > 2 ? `BL-${partes[partes.length - 1]}` : ref;
};

function Fila({ etiqueta, valor, clase = '' }) {
  return (
    <div className={`recibo-fila ${clase}`.trim()}>
      <span>{etiqueta}</span>
      <span>{valor}</span>
    </div>
  );
}

function MiCuenta({ cuenta, tienda, onEliminarCuenta }) {
  const [seccionActiva, setSeccionActiva] = useState('resumen');
  const [nombre, setNombre] = useState(cuenta.nombre);
  const [correo, setCorreo] = useState(cuenta.correo);
  const [celular, setCelular] = useState(cuenta.celular || cuenta.whatsapp || '');
  const [genero, setGenero] = useState(cuenta.genero || '');
  const [fechaNacimiento, setFechaNacimiento] = useState(
    cuenta.fechaNacimiento
      ? new Date(cuenta.fechaNacimiento).toISOString().slice(0, 10)
      : ''
  );
  const [fechaNacimientoBloqueada, setFechaNacimientoBloqueada] = useState(
    Boolean(cuenta.fechaNacimiento)
  );
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [contrasenaActual, setContrasenaActual] = useState('');
  const [contrasenaNueva, setContrasenaNueva] = useState('');
  const [confirmarContrasena, setConfirmarContrasena] = useState('');
  const [guardandoContrasena, setGuardandoContrasena] = useState(false);
  const [mensajeContrasena, setMensajeContrasena] = useState('');
  const [errorContrasena, setErrorContrasena] = useState('');
  const [pedidos, setPedidos] = useState([]);
  const [cargandoPedidos, setCargandoPedidos] = useState(false);
  const [errorPedidos, setErrorPedidos] = useState('');
  const [limitePedidos, setLimitePedidos] = useState(5);

  const cancelarPedido = async (id) => {
    const confirmado = window.confirm(
      '¿Deseas cancelar este pedido? Los puntos utilizados serán devueltos.'
    );

    if (!confirmado) return;

    try {
      await API.cancelarPedido(id);
      const historial = await API.pedidosCliente();
      setPedidos(historial);
      await tienda.refrescarCuenta();
      setMensaje('Pedido cancelado. Tus puntos han sido devueltos.');
      setErrorPedidos('');
    } catch (err) {
      setErrorPedidos(err.message || 'No fue posible cancelar el pedido.');
    }
  };

  useEffect(() => {
    if (!['pedidos', 'eventos'].includes(seccionActiva)) return;

    let activo = true;

    async function cargarPedidos() {
      setCargandoPedidos(true);
      setErrorPedidos('');

      try {
        const historial = await API.pedidosCliente();
        if (activo) setPedidos(historial);
      } catch (err) {
        if (activo) setErrorPedidos(err.message || 'No pudimos cargar tus pedidos.');
      } finally {
        if (activo) setCargandoPedidos(false);
      }
    }

    cargarPedidos();
    return () => { activo = false; };
  }, [seccionActiva]);

  const misEventos = pedidos.flatMap((pedido) =>
    pedido.productos
      .filter((producto) => producto.tipo === 'evento' || producto.id?.startsWith('club-') || producto.id?.startsWith('evento-'))
      .map((producto, i) => ({ ...producto, pedidoReferencia: pedido.referencia, estado: pedido.estado, indice: i }))
  );

  const pedidosVisibles = pedidos.slice(0, limitePedidos);

  return (
    <div className="mi-cuenta">
      <header className="mi-cuenta-encabezado">
        <p className="mi-cuenta-sobretitulo">TU ESPACIO EN BLOOMING</p>
        <h1>Mi cuenta</h1>
        <p>Un lugar para guardar tus lecturas, momentos y recompensas.</p>
      </header>

      <div className="mi-cuenta-contenedor">
        <aside className="mi-cuenta-navegacion">
          <div className="mi-cuenta-identidad">
            <span className="mi-cuenta-avatar">{cuenta.nombre.charAt(0).toUpperCase()}</span>
            <div>
              <strong>{cuenta.nombre}</strong>
              <span>Miembro Blooming</span>
            </div>
          </div>

          <nav aria-label="Secciones de mi cuenta">
            {SECCIONES.map((seccion) => (
              <button
                type="button"
                key={seccion.id}
                className={seccionActiva === seccion.id ? 'activo' : ''}
                aria-current={seccionActiva === seccion.id ? 'page' : undefined}
                onClick={() => {
                  setSeccionActiva(seccion.id);
                  setMensaje('');
                  setError('');
                }}
              >
                <i className={`ti ${seccion.icono}`} aria-hidden="true" />
                {seccion.nombre}
              </button>
            ))}
          </nav>
        </aside>

        <section className="mi-cuenta-contenido" aria-live="polite">
          <h2>{SECCIONES.find((s) => s.id === seccionActiva).nombre}</h2>

          {seccionActiva === 'resumen' && (
            <div className="mi-cuenta-resumen">
              <p>¡Qué alegría tenerte aquí, {cuenta.nombre.split(' ')[0]}!</p>
              <div className="mi-cuenta-tarjeta-puntos">
                <span>Tu saldo actual</span>
                <strong>{cuenta.puntos} puntos</strong>
                <span>Equivalencia en dinero</span>
                <strong>{formatoPrecio(cuenta.puntos * VALOR_PUNTO)}</strong>
                <div className="mi-cuenta-qr">
                  <QRCodeSVG value={cuenta.idCliente} size={160} level="M" includeMargin />
                  <strong>{cuenta.idCliente}</strong>
                  <span>Presenta tu código en la tienda para redimir tus puntos.</span>
                </div>
              </div>
            </div>
          )}

          {seccionActiva === 'perfil' && (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setMensaje('');
                setError('');
                setGuardando(true);

                try {
                  await tienda.actualizarCuenta({ nombre, correo, celular, genero, fechaNacimiento });
                  if (fechaNacimiento) setFechaNacimientoBloqueada(true);
                  setMensaje('Tus datos se actualizaron correctamente.');
                } catch (err) {
                  setError(err.message);
                } finally {
                  setGuardando(false);
                }
              }}
            >
              <p>Actualiza tu información personal.</p>
              <label htmlFor="perfil-nombre">Nombre completo</label>
              <input id="perfil-nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} required />

              <label htmlFor="perfil-correo">Correo electrónico</label>
              <input id="perfil-correo" type="email" value={correo} onChange={(e) => setCorreo(e.target.value)} required />

              <label htmlFor="perfil-celular">Número de celular</label>
              <input id="perfil-celular" type="tel" value={celular} onChange={(e) => setCelular(e.target.value)} required/>
              <label htmlFor="perfil-genero">Género</label>
              <select
                id="perfil-genero"
                value={genero}
                onChange={(e) => setGenero(e.target.value)}
              >
                <option value="">Sin especificar</option>
                <option value="femenino">Femenino</option>
                <option value="masculino">Masculino</option>
                <option value="prefiero_no_decir">Prefiero no decirlo</option>
              </select>

              <label htmlFor="perfil-nacimiento">Fecha de nacimiento</label>
              <input
                id="perfil-nacimiento"
                type="date"
                value={fechaNacimiento}
                onChange={(e) => setFechaNacimiento(e.target.value)}
                disabled={fechaNacimientoBloqueada}
                max={new Date().toISOString().slice(0, 10)}
                required={!fechaNacimientoBloqueada}
              />
              {mensaje && <p role="status">{mensaje}</p>}
              {error && <p role="alert">{error}</p>}

              <button type="submit" disabled={guardando}>
                {guardando ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </form>
          )}

          {seccionActiva === 'pedidos' && (
            <div className="mi-cuenta-pedidos">
              {cargandoPedidos && <p>Cargando tus pedidos...</p>}
              {errorPedidos && <p role="alert">{errorPedidos}</p>}
              {!cargandoPedidos && !errorPedidos && pedidos.length === 0 && <p>Aún no tienes pedidos. ¡Tu próxima visita a Blooming te espera!</p>}
              {!cargandoPedidos && pedidosVisibles.map((pedido) => (
                <article className="mi-cuenta-recibo" key={pedido.referencia}>
                  <header className="recibo-encabezado">
                    <h3 title={pedido.referencia}>Pedido {referenciaCorta(pedido.referencia)}</h3>
                    <p>{new Date(pedido.fecha).toLocaleString('es-CO')}</p>
                    <p className="recibo-estado">{pedido.estado}</p>
                  </header>

                  {pedido.estado === 'PENDIENTE' && (
                    <button
                      type="button"
                      onClick={() => cancelarPedido(pedido._id)}
                    >
                      Cancelar pedido
                    </button>
                  )}

                  <div className="recibo-bloque">
                    {pedido.productos.map((producto, i) => (
                      <Fila
                        key={`${producto.id}-${i}`}
                        etiqueta={`${producto.cantidad} × ${producto.nombre}`}
                        valor={formatoPrecio(producto.precio * producto.cantidad)}
                      />
                    ))}
                  </div>

                  <div className="recibo-bloque">
                    <Fila etiqueta="Subtotal" valor={formatoPrecio(pedido.subtotal)} />
                    {pedido.descuentoCodigo > 0 && (
                      <Fila etiqueta="Descuento" valor={`-${formatoPrecio(pedido.descuentoCodigo)}`} />
                    )}
                    {pedido.descuentoPuntos > 0 && (
                      <Fila etiqueta="Descuento por puntos" valor={`-${formatoPrecio(pedido.descuentoPuntos)}`} />
                    )}
                    {pedido.codigoDescuento && <Fila etiqueta="Código" valor={pedido.codigoDescuento} />}
                    {pedido.puntosUsados > 0 && <Fila etiqueta="Puntos usados" valor={pedido.puntosUsados} />}
                    <Fila etiqueta="Puntos ganados" valor={pedido.puntosGanados} />
                  </div>

                  <Fila clase="recibo-total" etiqueta="TOTAL PAGADO" valor={formatoPrecio(pedido.totalPagado)} />

                  <p className="recibo-gracias">¡Gracias por visitar Blooming!</p>
                </article>
              ))}

              {!cargandoPedidos && limitePedidos < pedidos.length && (
                <button type="button" className="mi-cuenta-ver-mas" onClick={() => setLimitePedidos((limite) => limite + 5)}>
                  Ver más pedidos
                </button>
              )}
            </div>
          )}

          {seccionActiva === 'puntos' && (
            <div className="mi-cuenta-tarjeta-puntos">
              <span>Tu saldo actual</span>
              <strong>{cuenta.puntos} puntos</strong>
              <span>Equivalencia en dinero</span>
              <strong>{formatoPrecio(cuenta.puntos * VALOR_PUNTO)}</strong>
              <div className="mi-cuenta-qr">
                <QRCodeSVG value={cuenta.idCliente} size={160} level="M" includeMargin />
                <strong>{cuenta.idCliente}</strong>
                <span>Presenta tu código en la tienda para redimir tus puntos.</span>
              </div>
            </div>
          )}

          {seccionActiva === 'eventos' && (
            <div className="mi-cuenta-eventos">
              {cargandoPedidos && <p>Cargando tus eventos...</p>}
              {errorPedidos && <p role="alert">{errorPedidos}</p>}
              {mensaje && <p role="status">{mensaje}</p>}
              {!cargandoPedidos && !errorPedidos && misEventos.length === 0 && (
                <p>Aún no tienes inscripciones. ¡Descubre nuestros próximos talleres y encuentros!</p>
              )}
              {!cargandoPedidos && !errorPedidos && misEventos.map((evento) => (
                <article className="mi-cuenta-recibo" key={`${evento.pedidoReferencia}-${evento.indice}`}>
                  <header className="recibo-encabezado">
                    <h3>{evento.tituloEvento || evento.nombre}</h3>
                    <p>{evento.fechaEvento || 'Fecha por confirmar'}</p>
                    {evento.horaEvento && <p>{evento.horaEvento}</p>}
                    {evento.lugarEvento && <p>{evento.lugarEvento}</p>}
                    <p className="recibo-estado">{evento.estado}</p>
                  </header>
                  <div className="recibo-bloque">
                    <Fila etiqueta="Inscripción" valor={formatoPrecio(evento.precio)} />
                    <Fila etiqueta="Cantidad" valor={evento.cantidad} />
                    <Fila etiqueta="Pedido" valor={referenciaCorta(evento.pedidoReferencia)} />
                  </div>
                </article>
              ))}
            </div>
          )}

          {seccionActiva === 'configuracion' && (
            <div className="mi-cuenta-configuracion">
              <h3>Administrar cuenta</h3>
              <h3>Cambiar contraseña</h3>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setMensajeContrasena('');
                  setErrorContrasena('');

                  if (contrasenaNueva.length < 8) {
                    setErrorContrasena('La contraseña debe tener al menos 8 caracteres.');
                    return;
                  }

                  if (contrasenaNueva !== confirmarContrasena) {
                    setErrorContrasena('Las contraseñas nuevas no coinciden.');
                    return;
                  }

                  setGuardandoContrasena(true);

                  try {
                    await API.cambiarContrasena({
                      contrasenaActual,
                      contrasenaNueva,
                    });

                    setContrasenaActual('');
                    setContrasenaNueva('');
                    setConfirmarContrasena('');
                    setMensajeContrasena('Tu contraseña se cambió correctamente.');
                  } catch (err) {
                    setErrorContrasena(err.message || 'No fue posible cambiar la contraseña.');
                  } finally {
                    setGuardandoContrasena(false);
                  }
                }}
              >
                <label htmlFor="contrasena-actual">Contraseña actual</label>
                <input
                  id="contrasena-actual"
                  type="password"
                  value={contrasenaActual}
                  onChange={(e) => setContrasenaActual(e.target.value)}
                  required
                />

                <label htmlFor="contrasena-nueva">Nueva contraseña</label>
                <input
                  id="contrasena-nueva"
                  type="password"
                  value={contrasenaNueva}
                  onChange={(e) => setContrasenaNueva(e.target.value)}
                  minLength={8}
                  required
                />

                <label htmlFor="confirmar-contrasena">Confirmar nueva contraseña</label>
                <input
                  id="confirmar-contrasena"
                  type="password"
                  value={confirmarContrasena}
                  onChange={(e) => setConfirmarContrasena(e.target.value)}
                  minLength={8}
                  required
                />

                {mensajeContrasena && <p role="status">{mensajeContrasena}</p>}
                {errorContrasena && <p role="alert">{errorContrasena}</p>}

                <button type="submit" disabled={guardandoContrasena}>
                  {guardandoContrasena ? 'Actualizando...' : 'Cambiar contraseña'}
                </button>
              </form>
              <p>Si deseas dejar de utilizar Blooming, puedes eliminar tu cuenta.</p>
              {error && <p role="alert">{error}</p>}
              <button
                type="button"
                className="cuenta-eliminar"
                onClick={async () => {
                  const contrasena = window.prompt(
                    'Ingresa tu contraseña para eliminar tu cuenta:'
                  );

                  if (contrasena === null || !contrasena.trim()) return;

                  const confirmado = window.confirm(
                    '¿Estás seguro? Esta acción no se puede deshacer.'
                  );

                  if (!confirmado) return;

                  try {
                    await onEliminarCuenta(contrasena);
                  } catch (err) {
                    setError(err.message);
                  }
                }}
              >
                Eliminar mi cuenta
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default MiCuenta;