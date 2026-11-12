
const mongoose = require('mongoose');

const eventoSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, trim: true },
    fecha: { type: String, required: true },
    tipo: {
      type: String,
      enum: ['club', 'evento'],
      required: true,
    },
    titulo: { type: String, required: true, trim: true },
    imagen: { type: String, default: '' },
    categoria: { type: String, default: '' },
    hora: { type: String, default: '' },
    duracion: { type: String, default: '' },
    lugar: { type: String, default: '' },
    libroId: { type: String, default: '' },
    lectura: { type: String, default: '' },
    dirige: { type: String, default: '' },
    reuniones: { type: [mongoose.Schema.Types.Mixed], default: [] },
    descripcion: { type: [String], default: [] },
    incluye: { type: [String], default: [] },
    precio: { type: Number, required: true, min: 0 },
    cupos: { type: Number, required: true, min: 0 },
    activo: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Evento', eventoSchema);
