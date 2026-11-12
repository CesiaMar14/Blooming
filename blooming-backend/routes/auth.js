
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { randomUUID, randomBytes, createHash } = require('crypto');
const Cliente = require('../models/Cliente');
const verificarToken = require('../middleware/auth');
const { verificarAdmin } = require('../middleware/auth');

const { Resend } = require('resend');

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const router = express.Router();

function datosPublicos(cliente) {
  return {
    idCliente: cliente.idCliente,
    nombre: cliente.nombre,
    correo: cliente.correo,
    celular: cliente.celular || cliente.whatsapp || '',
    genero: cliente.genero || null,
    fechaNacimiento: cliente.fechaNacimiento || null,
    puntos: cliente.puntos,
    rol: cliente.rol,
  };
}

// Registrar cliente

// Registrar cliente
router.post('/registro', async (req, res) => {
  try {
    const {nombre, correo, celular, whatsapp, genero, fechaNacimiento, contrasena,} = req.body;

    const numeroCelular = celular || whatsapp;

    const generosPermitidos = [
      'femenino',
      'masculino',
      'prefiero_no_decir',
    ];

    // Validar campos obligatorios
    if (!nombre || !correo || !numeroCelular || !contrasena) {
      return res.status(400).json({
        mensaje: 'Todos los campos son obligatorios.',
      });
    }

    // Validar género
    if (genero && !generosPermitidos.includes(genero)) {
      return res.status(400).json({
        mensaje: 'El género seleccionado no es válido.',
      });
    }

    // Validar fecha de nacimiento
    let nacimiento = null;

    if (fechaNacimiento) {
      if (
        typeof fechaNacimiento !== 'string' ||
        !/^\d{4}-\d{2}-\d{2}$/.test(fechaNacimiento)
      ) {
        return res.status(400).json({
          mensaje: 'La fecha de nacimiento no es válida.',
        });
      }

      nacimiento = new Date(`${fechaNacimiento}T00:00:00.000Z`);

      if (
        Number.isNaN(nacimiento.getTime()) ||
        nacimiento.toISOString().slice(0, 10) !== fechaNacimiento ||
        nacimiento > new Date()
      ) {
        return res.status(400).json({
          mensaje: 'La fecha de nacimiento no es válida.',
        });
      }
    }

    // Validar contraseña
    if (
      typeof contrasena !== 'string' ||
      contrasena.length < 8
    ) {
      return res.status(400).json({
        mensaje: 'La contraseña debe tener al menos 8 caracteres.',
      });
    }

    // Normalizar correo
    const email = String(correo).trim().toLowerCase();

    // Comprobar si el correo ya existe
    const existente = await Cliente.findOne({ correo: email });

    if (existente) {
      return res.status(409).json({
        mensaje: 'Este correo ya está registrado.',
      });
    }

    // Encriptar contraseña
    const passwordHash = await bcrypt.hash(contrasena, 12);

    // Crear cliente
    const cliente = await Cliente.create({
      idCliente: `BL-${randomUUID()}`,
      nombre: String(nombre).trim(),
      correo: email,
      celular: String(numeroCelular).trim(),
      genero: genero || null,
      fechaNacimiento: nacimiento,
      puntos: 500,
      passwordHash,
    });

    // Generar sesión
    const token = jwt.sign(
      { id: cliente._id },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    return res.status(201).json({
      mensaje: 'Cuenta creada correctamente.',
      token,
      cliente: datosPublicos(cliente),
    });

  } catch (error) {
    console.error('Error en registro:', error.message);

    return res.status(500).json({
      mensaje: 'No fue posible crear la cuenta.',
    });
  }
});


// Iniciar sesión
router.post('/login', async (req, res) => {
  try {
    const { correo, contrasena } = req.body;

    if (!correo || !contrasena) {
      return res.status(400).json({
        mensaje: 'Correo y contraseña son obligatorios.',
      });
    }

    const email = String(correo).trim().toLowerCase();

    const cliente = await Cliente.findOne({ correo: email })
      .select('+passwordHash');

    if (!cliente) {
      return res.status(401).json({
        mensaje: 'Correo o contraseña incorrectos.',
      });
    }

    const coincide = await bcrypt.compare(
      contrasena,
      cliente.passwordHash
    );

    if (!coincide) {
      return res.status(401).json({
        mensaje: 'Correo o contraseña incorrectos.',
      });
    }

    const token = jwt.sign(
      { id: cliente._id },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    return res.json({
      mensaje: 'Inicio de sesión correcto.',
      token,
      cliente: datosPublicos(cliente),
    });
  } catch (error) {
    console.error('Error en login:', error.message);
    return res.status(500).json({
      mensaje: 'No fue posible iniciar sesión.',
    });
  }
});


// Solicitar recuperación de contraseña
router.post('/recuperar-contrasena', async (req, res) => {
  try {
    const correo = String(req.body.correo || '').trim().toLowerCase();

    const respuesta = {
      mensaje: 'Si el correo está registrado, recibirás un enlace para recuperar tu contraseña.',
    };

    if (!correo || correo.length > 254) {
      return res.json(respuesta);
    }

    const cliente = await Cliente.findOne({ correo });

    if (!cliente) {
      return res.json(respuesta);
    }

    if (!resend || !process.env.EMAIL_FROM || !process.env.FRONTEND_URL) {
      console.error('Configuración de correo incompleta.');
      return res.status(503).json({
        mensaje: 'El servicio de recuperación no está disponible temporalmente.',
      });
    }

    const token = randomBytes(32).toString('hex');

    cliente.tokenRecuperacionHash = createHash('sha256')
      .update(token)
      .digest('hex');

    cliente.tokenRecuperacionExpira = new Date(Date.now() + 30 * 60 * 1000);

    await cliente.save();

    const enlace = `${process.env.FRONTEND_URL.replace(/\/$/, '')}/restablecer-contrasena?token=${encodeURIComponent(token)}`;

    const { error } = await resend.emails.send({
      from: process.env.EMAIL_FROM,
      to: [cliente.correo],
      subject: 'Recupera tu contraseña de Blooming',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
          <h2>Recuperación de contraseña</h2>
          <p>Hemos recibido una solicitud para cambiar la contraseña de tu cuenta Blooming.</p>
          <p>Haz clic en el siguiente botón para crear una nueva contraseña:</p>
          <p>
            <a href="${enlace}" style="display:inline-block;padding:12px 20px;background:#a65b78;color:white;text-decoration:none;border-radius:6px;">
              Restablecer contraseña
            </a>
          </p>
          <p>Este enlace caduca en 30 minutos y solo puede utilizarse una vez.</p>
          <p>Si no solicitaste este cambio, ignora este correo.</p>
        </div>
      `,
    });

    if (error) {
      cliente.tokenRecuperacionHash = undefined;
      cliente.tokenRecuperacionExpira = undefined;
      await cliente.save();

      console.error('Error enviando correo:', error.message);

      return res.status(502).json({
        mensaje: 'No fue posible enviar el correo de recuperación.',
      });
    }

    return res.json(respuesta);
  } catch (error) {
    console.error('Error al solicitar recuperación:', error.message);

    return res.status(500).json({
      mensaje: 'No fue posible procesar la solicitud.',
    });
  }
});

// Restablecer contraseña
router.post('/restablecer-contrasena', async (req, res) => {
  try {
    const { token, contrasenaNueva } = req.body;

    if (
      typeof token !== 'string' ||
      token.length !== 64 ||
      typeof contrasenaNueva !== 'string' ||
      contrasenaNueva.length < 8
    ) {
      return res.status(400).json({
        mensaje: 'El enlace no es válido o la contraseña no cumple los requisitos.',
      });
    }

    const tokenHash = createHash('sha256')
      .update(token)
      .digest('hex');

    const cliente = await Cliente.findOne({
      tokenRecuperacionHash: tokenHash,
      tokenRecuperacionExpira: { $gt: new Date() },
    }).select('+passwordHash +tokenRecuperacionHash +tokenRecuperacionExpira');

    if (!cliente) {
      return res.status(400).json({
        mensaje: 'El enlace de recuperación no es válido o ha caducado.',
      });
    }

    cliente.passwordHash = await bcrypt.hash(contrasenaNueva, 12);
    cliente.tokenRecuperacionHash = undefined;
    cliente.tokenRecuperacionExpira = undefined;

    await cliente.save();

    return res.json({
      mensaje: 'Tu contraseña se ha actualizado correctamente.',
    });
  } catch (error) {
    console.error('Error al restablecer contraseña:', error.message);

    return res.status(500).json({
      mensaje: 'No fue posible actualizar la contraseña.',
    });
  }
});

// Consultar perfil
router.get('/perfil', verificarToken, async (req, res) => {
  try {
    const cliente = await Cliente.findById(req.clienteId);

    if (!cliente) {
      return res.status(404).json({
        mensaje: 'Cliente no encontrado.',
      });
    }

    return res.json({
      cliente: datosPublicos(cliente),
    });
  } catch (error) {
    console.error('Error al consultar perfil:', error.message);
    return res.status(500).json({
      mensaje: 'No fue posible consultar el perfil.',
    });
  }
});

// Actualizar perfil

// Actualizar perfil
router.put('/perfil', verificarToken, async (req, res) => {
  try {
    const { nombre, correo, celular, whatsapp, genero, fechaNacimiento } = req.body;
    const numeroCelular = celular || whatsapp;
    const generosPermitidos = ['femenino', 'masculino', 'prefiero_no_decir'];

    if (!nombre || !correo || !numeroCelular) {
      return res.status(400).json({ mensaje: 'Nombre, correo y celular son obligatorios.' });
    }

    if (genero !== undefined && genero !== null && genero !== '' && !generosPermitidos.includes(genero)) {
      return res.status(400).json({ mensaje: 'El género seleccionado no es válido.' });
    }

    const email = String(correo).trim().toLowerCase();
    const correoUsado = await Cliente.findOne({ correo: email, _id: { $ne: req.clienteId } });

    if (correoUsado) {
      return res.status(409).json({ mensaje: 'Este correo ya está registrado.' });
    }

    const cliente = await Cliente.findById(req.clienteId);

    if (!cliente) {
      return res.status(404).json({ mensaje: 'Cliente no encontrado.' });
    }

    if (fechaNacimiento) {
      if (typeof fechaNacimiento !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(fechaNacimiento)) {
        return res.status(400).json({ mensaje: 'La fecha de nacimiento no es válida.' });
      }

      const nacimiento = new Date(`${fechaNacimiento}T00:00:00.000Z`);

      if (Number.isNaN(nacimiento.getTime()) || nacimiento.toISOString().slice(0, 10) !== fechaNacimiento || nacimiento > new Date()) {
        return res.status(400).json({ mensaje: 'La fecha de nacimiento no es válida.' });
      }

      if (cliente.fechaNacimiento) {
        if (new Date(cliente.fechaNacimiento).toISOString().slice(0, 10) !== fechaNacimiento) {
          return res.status(400).json({ mensaje: 'La fecha de nacimiento no se puede modificar.' });
        }
      } else {
        cliente.fechaNacimiento = nacimiento;
      }
    }

    cliente.nombre = String(nombre).trim();
    cliente.correo = email;
    cliente.celular = String(numeroCelular).trim();

    if (genero !== undefined) {
      cliente.genero = genero || null;
    }

    await cliente.save();

    return res.json({
      mensaje: 'Datos actualizados correctamente.',
      cliente: datosPublicos(cliente),
    });
  } catch (error) {
    console.error('Error al actualizar perfil:', error.message);
    return res.status(500).json({ mensaje: 'No fue posible actualizar los datos.' });
  }
});


// Cambiar contraseña
router.put('/contrasena', verificarToken, async (req, res) => {
  try {
    const { contrasenaActual, contrasenaNueva } = req.body;

    if (!contrasenaActual || !contrasenaNueva) {
      return res.status(400).json({
        mensaje: 'Debes indicar ambas contraseñas.',
      });
    }

    if (
      typeof contrasenaNueva !== 'string' ||
      contrasenaNueva.length < 8
    ) {
      return res.status(400).json({
        mensaje: 'La nueva contraseña debe tener al menos 8 caracteres.',
      });
    }

    const cliente = await Cliente.findById(req.clienteId)
      .select('+passwordHash');

    if (!cliente) {
      return res.status(404).json({
        mensaje: 'Cliente no encontrado.',
      });
    }

    const coincide = await bcrypt.compare(
      contrasenaActual,
      cliente.passwordHash
    );

    if (!coincide) {
      return res.status(401).json({
        mensaje: 'La contraseña actual es incorrecta.',
      });
    }

    cliente.passwordHash = await bcrypt.hash(contrasenaNueva, 12);
    await cliente.save();

    return res.json({
      mensaje: 'Contraseña actualizada correctamente.',
    });
  } catch (error) {
    console.error('Error al cambiar contraseña:', error.message);
    return res.status(500).json({
      mensaje: 'No fue posible cambiar la contraseña.',
    });
  }
});

// Eliminar cuenta
router.delete('/perfil', verificarToken, async (req, res) => {
  try {
    const { contrasena } = req.body;

    if (!contrasena) {
      return res.status(400).json({
        mensaje: 'Debes indicar tu contraseña para eliminar la cuenta.',
      });
    }

    const cliente = await Cliente.findById(req.clienteId)
      .select('+passwordHash');

    if (!cliente) {
      return res.status(404).json({
        mensaje: 'Cliente no encontrado.',
      });
    }

    const coincide = await bcrypt.compare(
      contrasena,
      cliente.passwordHash
    );

    if (!coincide) {
      return res.status(401).json({
        mensaje: 'La contraseña es incorrecta.',
      });
    }

    await Cliente.findByIdAndDelete(req.clienteId);

    return res.json({
      mensaje: 'Cuenta eliminada correctamente.',
    });
  } catch (error) {
    console.error('Error al eliminar cuenta:', error.message);
    return res.status(500).json({
      mensaje: 'No fue posible eliminar la cuenta.',
    });
  }
});

// Listar clientes para administración
router.get('/admin/clientes', verificarToken, verificarAdmin, async (req, res) => {
  try {
    const clientes = await Cliente.find()
      .select('idCliente nombre correo celular whatsapp genero fechaNacimiento puntos rol createdAt')
      .sort({ createdAt: -1 })
      .lean();

    return res.json({ clientes });
  } catch (error) {
    console.error('Error al consultar clientes:', error.message);
    return res.status(500).json({
      mensaje: 'No fue posible consultar los clientes.',
    });
  }
});

module.exports = router;