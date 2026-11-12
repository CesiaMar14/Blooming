
const express = require('express');
const Evento = require('../models/Evento');
const verificarToken = require('../middleware/auth');
const verificarAdmin = verificarToken.verificarAdmin;

const router = express.Router();

// Consultar eventos activos
router.get('/', async (req, res) => {
  try {
    const eventos = await Evento.find({ activo: true }).sort({ fecha: 1 });

    return res.json({ eventos });
  } catch (error) {
    console.error('Error al consultar eventos:', error.message);

    return res.status(500).json({
      mensaje: 'Error al consultar los eventos.',
    });
  }
});

// Crear evento (solo administrador)
router.post('/', verificarToken, verificarAdmin, async (req, res) => {
  try {
    const evento = await Evento.create(req.body);

    return res.status(201).json({
      mensaje: 'Evento creado correctamente.',
      evento,
    });
  } catch (error) {
    console.error('Error al crear evento:', error.message);

    return res.status(400).json({
      mensaje: 'No fue posible crear el evento. Revisa los datos y el ID.',
    });
  }
});

// Actualizar evento (solo administrador)
router.put('/:id', verificarToken, verificarAdmin, async (req, res) => {
  try {
    const evento = await Evento.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!evento) {
      return res.status(404).json({
        mensaje: 'Evento no encontrado.',
      });
    }

    return res.json({
      mensaje: 'Evento actualizado correctamente.',
      evento,
    });
  } catch (error) {
    console.error('Error al actualizar evento:', error.message);

    return res.status(400).json({
      mensaje: 'No fue posible actualizar el evento.',
    });
  }
});

module.exports = router;
