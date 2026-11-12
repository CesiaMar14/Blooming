
const mongoose = require('mongoose');

const libroSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, trim: true },
    titulo: { type: String, required: true, trim: true },
    autor: { type: String, required: true, trim: true },
    imagen: { type: String, default: '' },
    editorial: { type: String, default: '' },
    paginas: { type: Number, default: 0, min: 0 },
    precio: { type: Number, required: true, min: 0 },
    stockLibro: { type: Number, default: 30, min: 0 },
    stockCajita: { type: Number, default: 30, min: 0 },
    club: { type: Boolean, default: false },
    sinopsis: { type: [String], default: [] },
    cajaNombre: { type: String, default: '' },
    cajaConcepto: { type: String, default: '' },
    activo: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Libro', libroSchema);
