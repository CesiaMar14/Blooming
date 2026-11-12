const CLAVE_CONTACTOS = 'blooming-contactos-prueba';
const EVENTO_CONTACTOS = 'blooming-contactos-actualizados';

export function obtenerMensajes() {
  try {
    const guardados = localStorage.getItem(CLAVE_CONTACTOS);

    if (!guardados) return [];

    const mensajes = JSON.parse(guardados);

    return Array.isArray(mensajes) ? mensajes : [];
  } catch {
    return [];
  }
}

export function guardarMensajes(mensajes) {
  localStorage.setItem(CLAVE_CONTACTOS, JSON.stringify(mensajes));
  window.dispatchEvent(new Event(EVENTO_CONTACTOS));
}

export function guardarMensaje(datos) {
  const mensaje = {
    id: `contacto-${crypto.randomUUID()}`,
    nombre: datos.nombre.trim(),
    email: datos.email.trim(),
    mensaje: datos.mensaje.trim(),
    fecha: new Date().toISOString(),
    estado: 'nuevo',
  };

  const mensajes = obtenerMensajes();

  guardarMensajes([mensaje, ...mensajes]);

  return mensaje;
}

export function actualizarEstadoMensaje(id, estado) {
  const mensajes = obtenerMensajes().map((mensaje) =>
    mensaje.id === id ? { ...mensaje, estado } : mensaje
  );

  guardarMensajes(mensajes);
}

export function eliminarMensaje(id) {
  const mensajes = obtenerMensajes().filter(
    (mensaje) => mensaje.id !== id
  );

  guardarMensajes(mensajes);
}

export { EVENTO_CONTACTOS };