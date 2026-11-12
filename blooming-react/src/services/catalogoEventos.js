import { eventos as eventosIniciales } from '../data/eventos';

const CLAVE_EVENTOS = 'blooming-eventos-prueba';
const EVENTO_EVENTOS = 'blooming-eventos-actualizados';

export function obtenerEventos() {
  try {
    const guardados = localStorage.getItem(CLAVE_EVENTOS);

    if (!guardados) return eventosIniciales;

    const eventos = JSON.parse(guardados);

    return Array.isArray(eventos) ? eventos : eventosIniciales;
  } catch {
    return eventosIniciales;
  }
}

export function guardarEventos(eventos) {
  localStorage.setItem(CLAVE_EVENTOS, JSON.stringify(eventos));
  window.dispatchEvent(new Event(EVENTO_EVENTOS));
}

export { EVENTO_EVENTOS };