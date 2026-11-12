
require('dotenv').config();

const mongoose = require('mongoose');
const Menu = require('./models/Menu');

const menuInicial = {
  combos: [
    { id: 'estudiante', nombre: 'Estudiante', detalle: 'Espresso + Galletas de avena y pasas (x3)', precio: 15000 },
    { id: 'tarde-de-cafe', nombre: 'Tarde de café', detalle: 'Cappuccino + Brownie de chocolate', precio: 17000 },
    { id: 'brunch-ligero', nombre: 'Brunch ligero', detalle: 'Wrap de pollo + Limonada de coco', precio: 22000 },
    { id: 'dulce-firma', nombre: 'Dulce firma', detalle: 'Heathcliff + Emma', precio: 21000 },
    { id: 'cafe-y-croissant', nombre: 'Café y croissant', detalle: 'Americano + Croissant de chocolate', precio: 16000 },
    { id: 'infusion-y-pastel', nombre: 'Infusión y pastel', detalle: 'Té frío de frutos rojos + Muffin de arándanos', precio: 13000 },
  ],

  categorias: [
    {
      id: 'bebidas-calientes',
      titulo: 'Bebidas calientes',
      items: [
        { nombre: 'Espresso', precio: 6000 },
        { nombre: 'Americano', precio: 7000 },
        { nombre: 'Cappuccino', precio: 11000, etiquetas: 'Vegetariano, Contiene lácteos' },
        { nombre: 'Latte', precio: 12000, etiquetas: 'Vegetariano, Contiene lácteos' },
        { nombre: 'Mocha', precio: 13000, etiquetas: 'Vegetariano, Contiene lácteos' },
        {
          nombre: 'Café de origen colombiano',
          precio: 12000,
          descripcion: 'Cultivado bajo sombra por familias indígenas arhuacas, koguis, wiwas y kankuamas en las montañas de la Sierra Nevada de Santa Marta. Notas de chocolate, nuez y caramelo con un toque floral, acidez suave y cuerpo cremoso.',
        },
        { nombre: 'Chocolate caliente', precio: 8000, etiquetas: 'Vegetariano, Contiene lácteos' },
        { nombre: 'Té negro', precio: 7000 },
        { nombre: 'Infusión de frutos rojos', precio: 7000 },
      ],
    },
    {
      id: 'bebidas-frias',
      titulo: 'Bebidas frías',
      items: [
        { nombre: 'Café frío', precio: 10000 },
        { nombre: 'Smoothie de fresa y banano', precio: 10000, etiquetas: 'Vegetariano, Contiene lácteos' },
        { nombre: 'Matcha frío', precio: 19000, etiquetas: 'Vegetariano, Contiene lácteos' },
        { nombre: 'Té frío de frutos rojos', precio: 9000 },
        { nombre: 'Té frío de durazno', precio: 9000 },
        { nombre: 'Limonada natural', precio: 8000 },
        { nombre: 'Limonada de coco', precio: 12000, etiquetas: 'Vegetariano, Contiene lácteos' },
        { nombre: 'Agua de panela con limón', precio: 7000 },
        { nombre: 'Agua mineral', precio: 6000 },
      ],
    },
    {
      id: 'comida',
      titulo: 'Comidas',
      items: [
        { nombre: 'Ensalada César', precio: 20000, etiquetas: 'Contiene lácteos, huevo, gluten y pescado' },
        { nombre: 'Wrap de pollo', precio: 13000, etiquetas: 'Contiene lácteos, huevo y gluten' },
        { nombre: 'Sándwich de pavo', precio: 11000, etiquetas: 'Contiene lácteos, huevo y gluten' },
        { nombre: 'Panini de jamón y queso', precio: 10000, etiquetas: 'Contiene lácteos y gluten' },
        { nombre: 'Pan de yuca', precio: 6000, etiquetas: 'Vegetariano, Contiene lácteos y huevo, Sin harina de trigo' },
        { nombre: 'Croissant de jamón y queso', precio: 13000, etiquetas: 'Contiene lácteos y gluten' },
        { nombre: 'Croissant de chocolate', precio: 11000, etiquetas: 'Vegetariano, Contiene lácteos y gluten' },
      ],
    },
    {
      id: 'postres',
      titulo: 'Postres',
      items: [
        { nombre: 'Tarta de manzana', precio: 8000, etiquetas: 'Vegetariano, Contiene lácteos, huevo y gluten' },
        { nombre: 'Brownie de chocolate', precio: 7000, etiquetas: 'Vegetariano, Contiene lácteos, huevo, gluten y frutos secos' },
        { nombre: 'Galletas de avena y pasas', precio: 4000, etiquetas: 'Vegetariano, Contiene lácteos, huevo y gluten' },
        { nombre: 'Galletas de chispas de chocolate', precio: 6000, etiquetas: 'Vegetariano, Contiene lácteos, huevo y gluten' },
        { nombre: 'Muffin de arándanos', precio: 5000, etiquetas: 'Vegetariano, Contiene lácteos, huevo y gluten' },
        { nombre: 'Torta de zanahoria', precio: 6000, etiquetas: 'Vegetariano, Contiene lácteos, huevo, gluten y frutos secos' },
        { nombre: 'Torta de chocolate', precio: 7000, etiquetas: 'Vegetariano, Contiene lácteos, huevo y gluten' },
        { nombre: 'Roll de canela', precio: 6000, etiquetas: 'Vegetariano, Contiene lácteos, huevo y gluten' },
      ],
    },
  ],

  especiales: [
    { id: 'cova', nombre: 'Cova', cita: '“¡Los devoró la selva!”', descripcion: 'Arepa de maíz tostada con carne desmechada, aguacate y ají casero.', precio: 15000, etiquetas: 'Sin harina de trigo' },
    { id: 'quijote', nombre: 'El Quijote', cita: '“En un lugar de la Mancha, de cuyo nombre no quiero acordarme...”', descripcion: 'Tostadas de pan artesanal con queso costeño derretido, jamón serrano y miel.', precio: 16000, etiquetas: 'Contiene lácteos y gluten' },
    { id: 'heathcliff', nombre: 'Heathcliff', cita: '“¡Yo soy Heathcliff!”', descripcion: 'Limonada oscura de jamaica con romero y pimienta rosada.', precio: 9000 },
    { id: 'lear', nombre: 'Lear', cita: '“Nada saldrá de la nada.”', descripcion: 'Té negro ahumado con una rodaja de naranja quemada al soplete.', precio: 8000 },
    { id: 'emma', nombre: 'Emma', cita: '“Emma Woodhouse, hermosa, inteligente y rica...”', descripcion: 'Cheesecake de frutos rojos con crocante de almendras.', precio: 16000, etiquetas: 'Vegetariano, Contiene lácteos, huevo, gluten y frutos secos' },
    { id: 'dorian', nombre: 'Dorian', cita: '“Hay algo peor que se hable de uno: que no se hable en absoluto.”', descripcion: 'Chocolate oscuro con centro de mermelada de mora.', precio: 11000, etiquetas: 'Vegetariano, Contiene lácteos' },
  ],
};

async function cargarMenu() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const menuExistente = await Menu.findOne();

    if (menuExistente) {
      console.log('Ya existe un menú en MongoDB. No se modificó.');
      return;
    }

    await Menu.create(menuInicial);

    console.log('Menú inicial guardado correctamente.');
    console.log({
      combos: menuInicial.combos.length,
      categorias: menuInicial.categorias.length,
      especiales: menuInicial.especiales.length,
    });
  } catch (error) {
    console.error('Error al cargar el menú:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

cargarMenu();
