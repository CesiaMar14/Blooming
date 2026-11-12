const mongoose = require('mongoose');

const productoPedidoSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    nombre: { type: String, required: true },
    detalle: { type: String, default: '' },
    cantidad: { type: Number, required: true, min: 1 },
    precio: { type: Number, required: true, min: 0 },
    tipo: {
      type: String,
      enum: ['libro', 'cajita', 'evento'],
      required: true,
    },
    eventoId: { type: String, default: '' },
    fechaEvento: { type: String, default: '' },
    horaEvento: { type: String, default: '' },
    lugarEvento: { type: String, default: '' },
    tituloEvento: { type: String, default: '' },
  },
  { _id: false }
);

const pedidoSchema = new mongoose.Schema(
  {
    referencia: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    cliente: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Cliente',
      required: true,
    },
    idCliente: { type: String, default: '' },
    productos: {
      type: [productoPedidoSchema],
      required: true,
      validate: {
        validator: (productos) => productos.length > 0,
        message: 'El pedido debe contener al menos un producto.',
      },
    },
    subtotal: { type: Number, required: true, min: 0 },
    codigoDescuento: { type: String, default: '' },
    descuentoCodigo: { type: Number, default: 0, min: 0 },
    descuentoPuntos: { type: Number, default: 0, min: 0 },
    puntosUsados: { type: Number, default: 0, min: 0 },
    puntosGanados: { type: Number, default: 0, min: 0 },
    puntosAcreditados: { type: Boolean, default: false },
    puntosDevueltos: {type: Boolean, default: false},
    total: { type: Number, required: true, min: 0 },
    estado: {
      type: String,
      enum: ['PENDIENTE', 'APROBADO', 'RECHAZADO', 'CANCELADO'],
      default: 'PENDIENTE',
    },
    referenciaPago: { type: String, default: '' },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Pedido', pedidoSchema);
