
require('dotenv').config();

const mongoose = require('mongoose');
const Evento = require('./models/Evento');

const eventosIniciales = [
  {
    id: 'club-2026-11',
    fecha: '2026-11-28',
    tipo: 'club',
    titulo: 'Club de Lectura - Mes de Noviembre',
    imagen: '/imagenes/evento-1.webp',
    categoria: 'Club de lectura',
    hora: '15:30',
    duracion: '2 horas',
    lugar: 'Blooming',
    libroId: 'brisas',
    lectura: 'La lectura de este mes nos lleva a Barranquilla, a las casas, los secretos y las mujeres de En diciembre llegaban las brisas, la novela de Marvel Moreno. Leeremos con una meta por semana y conversaremos en un grupo de WhatsApp.',
    precio: 45000,
    cupos: 25,
    reuniones: [
      { tipo: 'virtual', fecha: '2026-11-15', hora: '16:00', duracion: '2 horas' },
      { tipo: 'presencial', fecha: '2026-11-28', hora: '15:30', duracion: '2 horas' },
    ],
    descripcion: [
      'El libro no está incluido en la inscripción, pero puedes comprarlo con Blooming.',
    ],
    incluye: [
      'Grupo de WhatsApp durante todo el mes',
      'Café, té, galletas y torta en la reunión presencial',
    ],
  },
  {
    id: 'taller-escritura-2026-11-12',
    fecha: '2026-11-12',
    tipo: 'evento',
    titulo: 'Taller de escritura: Tinta y primeras líneas',
    imagen: '/imagenes/evento-3.webp',
    categoria: 'Taller de escritura',
    hora: '16:00',
    duracion: '2 horas',
    lugar: 'Blooming',
    dirige: 'Mariana Cotes',
    descripcion: [
      'Una tarde para perder el miedo a la página en blanco. Escribiremos a partir de recuerdos, olores y objetos cotidianos, y compartiremos lo escrito en una lectura en voz baja.',
    ],
    incluye: [
      'La bebida de tu elección',
      'Un postre de la casa',
      'Los materiales (cuaderno y lápiz)',
    ],
    precio: 40000,
    cupos: 12,
  },
  {
    id: 'taller-acuarelas-2026-11-16',
    fecha: '2026-11-16',
    tipo: 'evento',
    titulo: 'Taller de acuarelas: Flores de agua',
    imagen: '/imagenes/evento-2.webp',
    categoria: 'Taller de acuarelas',
    hora: '15:00',
    duracion: '2 horas',
    lugar: 'Blooming',
    dirige: 'Daniela Arrieta',
    descripcion: [
      'Aprenderemos las técnicas básicas de la acuarela (degradados, húmedo sobre húmedo y pinceladas sueltas) para pintar una pequeña composición floral que te llevas a casa. No necesitas experiencia previa.',
    ],
    incluye: [
      'La bebida de tu elección',
      'Un postre de la casa',
      'Todos los materiales (papel, pinceles y pinturas)',
    ],
    precio: 55000,
    cupos: 12,
  },
  {
    id: 'taller-escritura-2026-11-26',
    fecha: '2026-11-26',
    tipo: 'evento',
    titulo: 'Taller de escritura: Cartas que nunca enviamos',
    imagen: '/imagenes/evento-3.webp',
    categoria: 'Taller de escritura',
    hora: '16:00',
    duracion: '2 horas',
    lugar: 'Blooming',
    dirige: 'Camilo Barrios',
    descripcion: [
      'Escribiremos cartas a personas, lugares o versiones de nosotros que ya no están, y trabajaremos la voz, el tono y la emoción en lo que contamos.',
    ],
    incluye: [
      'La bebida de tu elección',
      'Un postre de la casa',
      'Los materiales (papel y lápiz)',
    ],
    precio: 40000,
    cupos: 12,
  },
];

async function cargarEventos() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    let creados = 0;
    let existentes = 0;

    for (const datos of eventosIniciales) {
      const resultado = await Evento.updateOne(
        { id: datos.id },
        { $setOnInsert: datos },
        { upsert: true }
      );

      if (resultado.upsertedCount > 0) {
        creados++;
      } else {
        existentes++;
      }
    }

    console.log('Carga de eventos terminada.');
    console.log({ creados, existentes, total: eventosIniciales.length });
  } catch (error) {
    console.error('Error al cargar eventos:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

cargarEventos();
