import { useState } from 'react';
import { guardarMensaje } from '../services/catalogoContactos';

const CORREO = 'info@blooming.com';

function validar({ nombre, email, mensaje }) {
  const errores = {};
  if (nombre.trim().length < 2) {
    errores.nombre = 'Escribe tu nombre completo (mínimo 2 caracteres).';
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    errores.email = 'Escribe un correo electrónico válido.';
  }
  if (mensaje.trim().length < 10) {
    errores.mensaje = 'El mensaje debe tener al menos 10 caracteres.';
  }
  return errores;
}

function Contacto() {
  const [valores, setValores] = useState({ nombre: '', email: '', mensaje: '' });
  const [errores, setErrores] = useState({});
  const [estado, setEstado] = useState('');

  const cambiar = (e) => {
    const { name, value } = e.target;
    setValores((actual) => ({ ...actual, [name]: value }));
  };

  const enviar = async (e) => {
    e.preventDefault();
    const nuevosErrores = validar(valores);
    setErrores(nuevosErrores);

    if (Object.keys(nuevosErrores).length > 0) {
      setEstado('Revisa los campos marcados.');
      return;
    }

    try {
      await guardarMensaje(valores);
      setEstado('¡Mensaje enviado correctamente! Gracias por contactarnos.');
      setValores({ nombre: '', email: '', mensaje: '' });
      setErrores({});
    } catch (error) {
      setEstado(error.message || 'No se pudo enviar el mensaje. Inténtalo nuevamente.');
    }
  };

  return (
    <section id="contacto" className="contacto">
      <div className="contacto-wrapper">
        <div className="contacto-intro">
          <h2>Contacto</h2>
          <p>¡Contáctanos para más información!</p>
        </div>

        <div className="contacto-datos">
          <p>
            <i className="ti ti-brand-whatsapp" aria-hidden="true"></i>{' '}
            <a href="https://wa.me/573001234567" target="_blank" rel="noopener noreferrer">
              ¡Comunícate con nosotros!
            </a>
          </p>
          <p>
            <i className="ti ti-brand-instagram" aria-hidden="true"></i>{' '}
            <a href="https://instagram.com/blooming" target="_blank" rel="noopener noreferrer">
              @blooming
            </a>
          </p>
          <p>
            <i className="ti ti-phone" aria-hidden="true"></i>{' '}
            <a href="tel:+573001234567">+57 300 123 4567</a>
          </p>
          <p>
            <i className="ti ti-mail" aria-hidden="true"></i>{' '}
            <a href={`mailto:${CORREO}`}>{CORREO}</a>
          </p>

          <h3>¡Visítanos y vive la experiencia!</h3>
          <p>
            <i className="ti ti-map-pin-2" aria-hidden="true"></i> Carrera 74 #30 12,
            Barranquilla, Colombia
          </p>
          <p className="horario-contacto">
            <i className="ti ti-clock" aria-hidden="true"></i>
            <span>Lun-Vie: 8:00 AM - 8:00 PM</span>
            <span>Sáb, Dom y Festivos: 8:00 AM - 9:00 PM</span>
          </p>
          <a
            href="https://www.google.com/maps/search/?api=1&query=Carrera+74+%2330+12+Barranquilla+Colombia"
            className="boton-como-llegar"
            target="_blank"
            rel="noopener noreferrer"
          >
            Cómo llegar
          </a>
        </div>

        <div className="formulario-contacto">
          <h3>Envíanos un mensaje</h3>
          <form id="form-contacto" onSubmit={enviar} noValidate>
            <div className="form-grupo">
              <label htmlFor="nombre">Nombre Completo</label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                placeholder="Tu nombre"
                value={valores.nombre}
                onChange={cambiar}
                aria-describedby="nombre-error"
                aria-invalid={errores.nombre ? 'true' : undefined}
              />
              <p className="form-error" id="nombre-error">{errores.nombre}</p>
            </div>

            <div className="form-grupo">
              <label htmlFor="email">Correo Electrónico</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="tucorreo@ejemplo.com"
                value={valores.email}
                onChange={cambiar}
                aria-describedby="email-error"
                aria-invalid={errores.email ? 'true' : undefined}
              />
              <p className="form-error" id="email-error">{errores.email}</p>
            </div>

            <div className="form-grupo">
              <label htmlFor="mensaje">Redacta el mensaje</label>
              <textarea
                id="mensaje"
                name="mensaje"
                placeholder="Cuéntanos en qué podemos ayudarte."
                value={valores.mensaje}
                onChange={cambiar}
                aria-describedby="mensaje-error"
                aria-invalid={errores.mensaje ? 'true' : undefined}
              />
              <p className="form-error" id="mensaje-error">{errores.mensaje}</p>
            </div>

            <button type="submit" className="btn-enviar">Enviar mensaje</button>
            <p className="form-estado" role="status" aria-live="polite">{estado}</p>
          </form>
        </div>
      </div>
    </section>
  );
}

export default Contacto;