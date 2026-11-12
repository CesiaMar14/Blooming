import { obtenerLibros } from '../services/catalogoLibros';
import { obtenerMenu } from '../services/catalogoMenu';
import { eventos } from '../data/eventos';

const normalizar = (texto = '') =>
  texto
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

function obtenerResultadosBusqueda() {
  const { combos, categorias, especiales } = obtenerMenu();

  return [
    ...obtenerLibros().map((libro) => ({
      id: `libro-${libro.id}`,
      tipo: 'Libro',
      titulo: libro.titulo,
      detalle: `${libro.autor} · ${libro.editorial}`,
      texto: [
        libro.titulo,
        libro.autor,
        libro.editorial,
        ...(libro.sinopsis ?? []),
      ].join(' '),
      destino: `/libros?libro=${libro.id}`,
    })),

    ...combos.map((combo) => ({
      id: `combo-${combo.id}`,
      tipo: 'Combo',
      titulo: combo.nombre,
      detalle: combo.detalle,
      texto: `${combo.nombre} ${combo.detalle}`,
      destino: '/menu#combos',
    })),

    ...categorias.flatMap((categoria) =>
      categoria.items.map((item, indice) => ({
        id: `menu-${categoria.id}-${indice}`,
        tipo: categoria.titulo,
        titulo: item.nombre,
        detalle: categoria.titulo,
        texto: [
          item.nombre,
          categoria.titulo,
          item.descripcion,
          item.etiquetas,
        ].join(' '),
        destino: `/menu#${categoria.id}`,
      }))
    ),

    ...especiales.map((especial) => ({
      id: `especial-${especial.id}`,
      tipo: 'Especial',
      titulo: especial.nombre,
      detalle: especial.descripcion,
      texto: [
        especial.nombre,
        especial.cita,
        especial.descripcion,
        especial.etiquetas,
      ].join(' '),
      destino: '/menu#especiales',
    })),

    ...eventos.map((evento) => ({
      id: `evento-${evento.id}`,
      tipo: evento.categoria,
      titulo: evento.titulo,
      detalle: evento.dirige
        ? `Facilita: ${evento.dirige}`
        : 'Blooming',
      texto: [
        evento.titulo,
        evento.categoria,
        evento.dirige,
        evento.lectura,
        ...(evento.descripcion ?? []),
        ...(evento.incluye ?? []),
      ].join(' '),
      destino: `/eventos?fecha=${evento.fecha}`,
    })),
  ];
}

export function buscarEnBlooming(consulta) {
  const terminos = normalizar(consulta).split(/\s+/).filter(Boolean);

  if (!terminos.length) return [];

  const resultadosBusqueda = obtenerResultadosBusqueda();

  return resultadosBusqueda
    .filter((resultado) => {
      const contenido = normalizar(
        `${resultado.titulo} ${resultado.detalle} ${resultado.texto}`
      );

      return terminos.every((termino) => contenido.includes(termino));
    })
    .slice(0, 8);
}