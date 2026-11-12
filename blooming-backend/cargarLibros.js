
require('dotenv').config();

const mongoose = require('mongoose');
const Libro = require('./models/Libro');

const librosIniciales = [
  {
    id: 'brisas',
    titulo: 'En diciembre llegaban las brisas',
    autor: 'Marvel Moreno',
    imagen: '/imagenes/en-diciembre-llegaban-las-brisas.jpg',
    editorial: 'Alfaguara',
    paginas: 448,
    precio: 82000,
    club: true,
    sinopsis: [
      'Desde París, Lina recuerda la historia de tres mujeres cuyas vidas transcurren en la conservadora ciudad de Barranquilla. Entre fiestas en el Country Club y paseos a Puerto Colombia se desencadena una historia de sensualidad aplacada por la violencia, un relato de represión y desenfreno en el que Dora, Catalina y Beatriz son solo víctimas de un patriarcado alojado en las delgadas fibras de su tejido social. Frágiles, rebeldes, llenas de placer y de dolor, estas mujeres sobreviven a un mundo que se mueve entre la liberación del instinto y la protección de la costumbre.',
    ],
    cajaNombre: '',
    cajaConcepto: 'Barranquilla, entre fiestas y apariencias. Una lectura que mira de frente lo que la costumbre prefería callar.',
  },
  {
    id: 'cosecha',
    titulo: 'Amanecer en la cosecha',
    autor: 'Suzanne Collins',
    imagen: '/imagenes/amanecer-en-la-cosecha.jpg',
    editorial: 'Molino',
    paginas: 496,
    precio: 75000,
    club: false,
    sinopsis: [
      'Amanece el día de los Quincuagésimos Juegos del Hambre y el miedo atenaza a los distritos de Panem. Este año, en honor al Vasallaje de los Veinticinco, se llevarán de sus hogares al doble de tributos.',
      'En el Distrito 12, Haymitch Abernathy intenta no pensar demasiado en sus probabilidades. Lo único que le importa es que se acabe el día para poder estar con su chica.',
      'Cuando anuncian el nombre de Haymitch, todos sus sueños se rompen en pedazos. Lo separan de su familia y de su amada, y lo envían al Capitolio con los otros tres tributos del Distrito 12: una amiga que es casi como una hermana pequeña para él, un chico obsesionado con analizar apuestas y la chica más estirada de la ciudad. Cuando empiezan los Juegos, Haymitch comprende que en el Capitolio quieren que fracase. Sin embargo, algo dentro de él desea luchar… y que el eco de esa lucha llegue mucho más allá de la mortífera arena.',
    ],
    cajaNombre: '',
    cajaConcepto: 'Panem, un sorteo y una injusticia que nadie eligió. Una lectura tensa, de las que se leen con el corazón apretado.',
  },
  {
    id: 'criada',
    titulo: 'El cuento de la criada',
    autor: 'Margaret Atwood',
    imagen: '/imagenes/el-cuento-de-la-criada.jpg',
    editorial: 'Salamandra',
    paginas: 412,
    precio: 85000,
    club: false,
    sinopsis: [
      'Esta trama, inquietante y oscura, que bien podría encontrarse en cualquier obra actual, pertenece en realidad a esta novela escrita por Margaret Atwood a principios de los ochenta, en la que la afamada autora canadiense anticipó con llamativa premonición una amenaza latente en el mundo de hoy. En la República de Gilead, el cuerpo de Defred solo sirve para procrear, tal como imponen las férreas normas establecidas por la dictadura puritana que domina el país.',
      'Los peligros inherentes a mezclar religión y política, el empeño de todo poder absoluto en someter a las mujeres como paso conducente a sojuzgar a toda la población y la fuerza incontenible del deseo como elemento transgresor son tan solo una muestra de los temas que aborda este relato desgarrador.',
    ],
    cajaNombre: '',
    cajaConcepto: 'Gilead, donde el cuerpo de las mujeres pertenece al Estado. Una lectura incómoda, para leer con calma y conversar después.',
  },
  {
    id: 'sentido',
    titulo: 'Sentido y sensibilidad',
    autor: 'Jane Austen',
    imagen: '/imagenes/sentido-y-sensibilidad.jpg',
    editorial: 'Penguin Clásicos',
    paginas: 376,
    precio: 49000,
    club: false,
    sinopsis: [
      'Tres hermanas solteras y su madre van a sufrir en carne propia el hecho de que no haya un varón en la familia. Es que en la Inglaterra de principios del siglo XIX solo heredaban los hijos varones. En medio de sus privaciones económicas, las dos hermanas mayores descubrirán el amor, aunque de manera muy diferente.',
    ],
    cajaNombre: '',
    cajaConcepto: 'Inglaterra, principios del siglo XIX, donde heredar o no heredar lo cambia todo. Una lectura de ironía fina sobre el dinero, la razón y la emoción.',
  },
  {
    id: 'vegetariana',
    titulo: 'La vegetariana',
    autor: 'Han Kang',
    imagen: '/imagenes/la-vegetariana.jpg',
    editorial: 'Random House',
    paginas: 168,
    precio: 59000,
    club: false,
    sinopsis: [
      'Hasta ahora, Yeonghye ha sido la esposa diligente y discreta que su marido siempre ha deseado. Todo cambia cuando unas pesadillas brutales y sanguinarias empiezan a despertarla por las noches, y siente la imperiosa necesidad de deshacerse de toda la carne del frigorífico.',
      'Situada en Corea del Sur, La vegetariana es la historia de una metamorfosis radical y un acto de resistencia contra la violencia y la intolerancia humanas.',
    ],
    cajaNombre: '',
    cajaConcepto: 'Corea del Sur, un matrimonio y una decisión que nadie entiende. Una lectura perturbadora y breve, que deja más preguntas que respuestas.',
  },
  {
    id: 'yesteryear',
    titulo: 'Yesteryear',
    autor: 'Caro Claire Burke',
    imagen: '/imagenes/yesteryear.jpg',
    editorial: 'Adn',
    paginas: 485,
    precio: 92000,
    club: false,
    sinopsis: [
      'Me llamo Natalie Heller Mills y era perfecta en el arte de vivir.',
      'Natalie Heller Mills es la perfecta mujer americana tradicional: esposa, madre de seis hijos y reina de las redes sociales. Detrás de las cámaras, sin embargo, hay niñeras, productores, electrodomésticos industriales y un marido heredero de una poderosa dinastía política.',
      'Hasta que una mañana despierta en una realidad que no reconoce. Su casa, su marido y sus hijos están ahí, pero todo es distinto. Una fecha tallada en la puerta: 1855. Ayer posaba tarros de mermelada para Instagram; hoy arrastra leña y lava ropa a mano.',
    ],
    cajaNombre: '',
    cajaConcepto: 'Una influencer, un rancho y un salto a 1855. Una lectura inquietante sobre la imagen de la vida perfecta y lo que cuesta sostenerla.',
  },
];

async function cargarLibros() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    let creados = 0;
    let existentes = 0;

    for (const datos of librosIniciales) {
      const resultado = await Libro.updateOne(
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

    console.log('Carga de libros terminada.');
    console.log({ creados, existentes, total: librosIniciales.length });
  } catch (error) {
    console.error('Error al cargar libros:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

cargarLibros();
