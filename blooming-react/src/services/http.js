const API_URL = import.meta.env.VITE_API_URL || '/api';

export async function solicitar(endpoint, opciones = {}) {
  let token;

  try {
    token = localStorage.getItem('blooming-token') || '';
  } catch {
    throw new Error('No fue posible consultar la sesión.');
  }

  const respuesta = await fetch(`${API_URL}${endpoint}`, {
    ...opciones,
    headers: {
      'Content-Type': 'application/json',
      ...(token
        ? { Authorization: `Bearer ${token}` }
        : {}),
      ...opciones.headers,
    },
  });

  const datos = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(
      datos.mensaje || 'Error al comunicarse con el servidor.'
    );
  }

  return datos;
}
