import { libros as librosIniciales } from '../data/libros';

const CLAVE_LIBROS = 'blooming-libros-prueba';
const EVENTO_LIBROS = 'blooming-libros-actualizados';

export function obtenerLibros() {
  try {
    const guardados = localStorage.getItem(CLAVE_LIBROS);

    if (!guardados) return librosIniciales;

    const libros = JSON.parse(guardados);

    return Array.isArray(libros) ? libros : librosIniciales;
  } catch {
    return librosIniciales;
  }
}

export function guardarLibros(libros) {
  localStorage.setItem(CLAVE_LIBROS, JSON.stringify(libros));

  window.dispatchEvent(new Event(EVENTO_LIBROS));
}

export { EVENTO_LIBROS };