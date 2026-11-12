
const jwt = require('jsonwebtoken');
const Cliente = require('../models/Cliente');

function verificarToken(req, res, next) {
  const encabezado = req.headers.authorization;

  if (!encabezado || !encabezado.startsWith('Bearer ')) {
    return res.status(401).json({
      mensaje: 'No autorizado. Debes iniciar sesión.',
    });
  }

  const token = encabezado.split(' ')[1];

  try {
    const decodificado = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    req.clienteId = decodificado.id;

    next();
  } catch (error) {
    return res.status(401).json({
      mensaje: 'Token inválido o expirado.',
    });
  }
}

async function verificarAdmin(req, res, next) {
  try {
    const cliente = await Cliente.findById(req.clienteId);

    if (!cliente || cliente.rol !== 'admin') {
      return res.status(403).json({
        mensaje: 'No tienes permisos de administrador.',
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      mensaje: 'Error al verificar permisos.',
    });
  }
}

module.exports = verificarToken;
module.exports.verificarAdmin = verificarAdmin;
