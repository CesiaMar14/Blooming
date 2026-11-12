
require('dotenv').config();

const dns = require('node:dns');
dns.setDefaultResultOrder('ipv4first');

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth');
const pedidoRoutes = require('./routes/pedidos');
const libroRoutes = require('./routes/libros');
const eventoRoutes = require('./routes/eventos');
const menuRoutes = require('./routes/menu');
const iaRoutes = require('./routes/ia');

const app = express();

const origenesPermitidos = [
  'http://localhost:5173',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: origenesPermitidos,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/pedidos', pedidoRoutes);
app.use('/api/libros', libroRoutes);
app.use('/api/eventos', eventoRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/ia', iaRoutes);

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('¡Bienvenido al backend de Blooming!');
});

async function iniciarServidor() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log('MongoDB conectado correctamente');

    app.listen(PORT, () => {
      console.log(`Servidor de Blooming funcionando en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Error al conectar con MongoDB:', error.message);
    process.exit(1);
  }
}

iniciarServidor();
