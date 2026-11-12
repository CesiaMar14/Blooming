require('dotenv').config();

const mongoose = require('mongoose');
const Cliente = require('./models/Cliente');

async function promoverAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const correo = 'cesiasofia123@gmail.com';

    const cliente = await Cliente.findOneAndUpdate(
      { correo },
      { $set: { rol: 'admin' } },
      { new: true, runValidators: true }
    );

    if (!cliente) {
      console.log('No se encontró una cuenta con ese correo.');
      return;
    }

    console.log('Cuenta promovida correctamente:');
    console.log({
      nombre: cliente.nombre,
      correo: cliente.correo,
      rol: cliente.rol,
    });
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

promoverAdmin();
