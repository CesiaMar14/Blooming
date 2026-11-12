
const express = require('express');
const { GoogleGenAI } = require('@google/genai');

const verificarToken = require('../middleware/auth');
const verificarAdmin = verificarToken.verificarAdmin;

const Pedido = require('../models/Pedido');
const Libro = require('../models/Libro');
const Evento = require('../models/Evento');
const Cliente = require('../models/Cliente');

const router = express.Router();

const ai = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
  : null;

router.post('/admin', verificarToken, verificarAdmin, async (req, res) => {
  let temporizador;

  try {
    const pregunta = String(req.body.pregunta || '').trim();

    if (!pregunta || pregunta.length > 1500) {
      return res.status(400).json({
        mensaje: 'Escribe una pregunta de máximo 1500 caracteres.',
      });
    }

    if (!ai) {
      return res.status(500).json({
        mensaje: 'La API de Gemini no está configurada.',
      });
    }

    const [
      totalPedidos,
      pedidosPorEstado,
      ventas,
      totalLibros,
      totalEventos,
      totalClientes,
    ] = await Promise.all([
      Pedido.countDocuments(),
      Pedido.aggregate([
        {
          $group: {
            _id: '$estado',
            cantidad: { $sum: 1 },
          },
        },
      ]),
      Pedido.aggregate([
        { $match: { estado: 'APROBADO' } },
        {
          $group: {
            _id: null,
            total: { $sum: '$total' },
          },
        },
      ]),
      Libro.countDocuments({ activo: true }),
      Evento.countDocuments({ activo: true }),
      Cliente.countDocuments({ rol: 'cliente' }),
    ]);

    const datos = {
      totalPedidos,
      pedidosPorEstado,
      ventasAprobadas: ventas[0]?.total || 0,
      librosActivos: totalLibros,
      eventosActivos: totalEventos,
      clientesRegistrados: totalClientes,
    };

    const respuesta = await Promise.race([
      ai.models.generateContent({
        model: 'gemini-3.5-flash-lite',
        contents: `
          Eres el asistente administrativo de Blooming,
          una librería con eventos y productos especiales.

          Responde siempre en español.
          Sé claro, profesional y práctico.
          Analiza los datos reales proporcionados.
          No inventes cifras ni información.
          Si no tienes un dato, indícalo.
          No afirmes que puedes modificar pedidos
          ni inventario.

          DATOS DEL NEGOCIO:
          ${JSON.stringify(datos, null, 2)}

          PREGUNTA DEL ADMINISTRADOR:
          ${pregunta}
        `,
      }),
      new Promise((_, reject) => {
        temporizador = setTimeout(
          () => reject(new Error('Gemini tardó demasiado en responder.')),
          30000
        );
      }),
    ]);

    return res.json({
      respuesta: respuesta.text || 'No se recibió una respuesta de Gemini.',
      datos,
    });
  } catch (error) {
    console.error('Error en la IA administrativa:', error.message);

    return res.status(500).json({
      mensaje: 'No fue posible obtener una respuesta de la IA.',
      detalle: error.message,
    });
  } finally {
    clearTimeout(temporizador);
  }
});

module.exports = router;
