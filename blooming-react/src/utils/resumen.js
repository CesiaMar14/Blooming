import {
  PESOS_POR_PUNTO_GANADO, VALOR_PUNTO, TOPE_PORCENTAJE, MINIMO_CANJE,
} from '../config';

export function calcularResumen({ carrito, opciones, saldo }) {
  const subtotal = carrito.reduce((s, p) => s + p.precio * p.cantidad, 0);

  let descuentoCodigo = 0;
  if (opciones.codigo) {
    const c = opciones.codigo;
    descuentoCodigo = c.tipo === 'porcentaje' ? Math.round((subtotal * c.valor) / 100) : c.valor;
    descuentoCodigo = Math.min(descuentoCodigo, subtotal);
  }
  const restante = subtotal - descuentoCodigo;

  const maximoPorTope = Math.floor((restante * TOPE_PORCENTAJE) / (100 * VALOR_PUNTO));
  const puntosUsables = Math.min(saldo, maximoPorTope);
  const puedeCanjear = puntosUsables >= MINIMO_CANJE;
  const puntosUsados = opciones.usarPuntos && puedeCanjear ? puntosUsables : 0;
  const descuentoPuntos = puntosUsados * VALOR_PUNTO;

  const total = restante - descuentoPuntos;
  const puntosGanados = Math.floor(total / PESOS_POR_PUNTO_GANADO);

  return {
    subtotal, descuentoCodigo, saldo, puntosUsables, puedeCanjear,
    puntosUsados, descuentoPuntos, total, puntosGanados,
  };
}