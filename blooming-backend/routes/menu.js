
const express = require('express');
const Menu = require('../models/Menu');
const verificarToken = require('../middleware/auth');
const verificarAdmin = verificarToken.verificarAdmin;

const router = express.Router();

// Consultar menú
router.get('/', async (req, res) => {
  try {
    const menu = await Menu.findOne();

    return res.json({
      menu: menu || {
        combos: [],
        categorias: [],
        especiales: [],
      },
    });
  } catch (error) {
    console.error('Error al consultar menú:', error.message);

    return res.status(500).json({
      mensaje: 'Error al consultar el menú.',
    });
  }
});

// Guardar menú completo (solo administrador)
router.put('/', verificarToken, verificarAdmin, async (req, res) => {
  try {
    const { combos, categorias, especiales } = req.body;

    if (
      !Array.isArray(combos) ||
      !Array.isArray(categorias) ||
      !Array.isArray(especiales)
    ) {
      return res.status(400).json({
        mensaje: 'El menú debe contener combos, categorías y especiales.',
      });
    }

    const menu = await Menu.findOneAndUpdate(
      {},
      { $set: { combos, categorias, especiales } },
      { new: true, upsert: true, runValidators: true }
    );

    return res.json({
      mensaje: 'Menú actualizado correctamente.',
      menu,
    });
  } catch (error) {
    console.error('Error al guardar menú:', error.message);

    return res.status(400).json({
      mensaje: 'No fue posible guardar el menú.',
    });
  }
});

module.exports = router;
