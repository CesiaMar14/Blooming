const mongoose = require('mongoose');

const clienteSchema = new mongoose.Schema(
  {
    idCliente: {
      type: String,
      required: true,
      unique: true,
    },
    nombre: {
      type: String,
      required: true,
      trim: true,
    },
    correo: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    celular: {
      type: String,
      required: true,
      trim: true,
    },
    genero: {
      type: String,
      enum: ['femenino', 'masculino', 'otro', 'prefiero_no_decir'],
      default: null,
    },
    fechaNacimiento: {
      type: Date,
      default: null,
    },
    puntos: {
      type: Number,
      default: 500,
      min: 0,
    },
    rol: {
      type: String,
      enum: ['cliente', 'admin'],
      default: 'cliente',
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    tokenRecuperacionHash: {
      type: String,
      default: undefined,
      select: false,
    },
    tokenRecuperacionExpira: {
      type: Date,
      default: undefined,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Cliente', clienteSchema);
