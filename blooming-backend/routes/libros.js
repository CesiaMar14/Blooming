
const express = require('express');
const Libro = require('../models/Libro');
const verificarToken = require('../middleware/auth');
const verificarAdmin = verificarToken.verificarAdmin;

const router = express.Router();

// Consultar libros activos
router.get('/', async (req, res) => {
  try {
    const libros = await Libro.find({ activo: true }).sort({ titulo: 1 });

    return res.json({ libros });
  } catch (error) {
    console.error('Error al consultar libros:', error.message);

    return res.status(500).json({
      mensaje: 'Error al consultar los libros.',
    });
  }
});

// Crear libro (solo administrador)
router.post('/', verificarToken, verificarAdmin, async (req, res) => {
  try {
    const libro = await Libro.create(req.body);

    return res.status(201).json({
      mensaje: 'Libro creado correctamente.',
      libro,
    });
  } catch (error) {
    console.error('Error al crear libro:', error.message);

    return res.status(400).json({
      mensaje: 'No fue posible crear el libro. Revisa los datos y el ID.',
    });
  }
});

// Actualizar libro (solo administrador)
router.put('/:id', verificarToken, verificarAdmin, async (req, res) => {
  try {
    const libro = await Libro.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!libro) {
      return res.status(404).json({
        mensaje: 'Libro no encontrado.',
      });
    }

    return res.json({
      mensaje: 'Libro actualizado correctamente.',
      libro,
    });
  } catch (error) {
    console.error('Error al actualizar libro:', error.message);

    return res.status(400).json({
      mensaje: 'No fue posible actualizar el libro.',
    });
  }
});

module.exports = router;
