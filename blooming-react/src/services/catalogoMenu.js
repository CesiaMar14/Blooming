import {
  combos as combosIniciales,
  categorias as categoriasIniciales,
  especiales as especialesIniciales,
} from '../data/menu';
import { API } from '../services/api';

const CLAVE_MENU = 'blooming-menu-prueba';
const EVENTO_MENU = 'blooming-menu-actualizado';

export function obtenerMenu() {
  try {
    const guardado = localStorage.getItem(CLAVE_MENU);

    if (!guardado) {
      return {
        combos: combosIniciales,
        categorias: categoriasIniciales,
        especiales: especialesIniciales,
      };
    }

    const menu = JSON.parse(guardado);

    return {
      combos: Array.isArray(menu.combos) ? menu.combos : combosIniciales,
      categorias: Array.isArray(menu.categorias)
        ? menu.categorias
        : categoriasIniciales,
      especiales: Array.isArray(menu.especiales)
        ? menu.especiales
        : especialesIniciales,
    };
  } catch {
    return {
      combos: combosIniciales,
      categorias: categoriasIniciales,
      especiales: especialesIniciales,
    };
  }
}

export function guardarMenu(menu) {
  localStorage.setItem(CLAVE_MENU, JSON.stringify(menu));
  window.dispatchEvent(new Event(EVENTO_MENU));
}

export { EVENTO_MENU };