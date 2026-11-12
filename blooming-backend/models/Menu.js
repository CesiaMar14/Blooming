
const mongoose = require('mongoose');

const menuSchema = new mongoose.Schema(
  {
    combos: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    categorias: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    especiales: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Menu', menuSchema);
