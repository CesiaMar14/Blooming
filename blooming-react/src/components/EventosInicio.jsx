import { Link } from 'react-router-dom';
import Carrusel from './Carrusel';

const eventos = [
  { src: '/imagenes/evento-1.webp', alt: 'Club de lectura' },
  { src: '/imagenes/evento-2.webp', alt: 'Taller de acuarela' },
  { src: '/imagenes/evento-3.webp', alt: 'Taller de escritura' },
];

function EventosInicio() {
  return (
    <section id="eventos" className="eventos-inicio">
      <div className="texto-eventos-inicio">
        <h2>Eventos</h2>
        <p>Participa en nuestros eventos, que van desde nuestro club de lectura, talleres de escritura, talleres de manualidades, presentaciones de libros, hasta exposiciones y charlas.</p>
        <p>Descubre nuevas oportunidades para aprender. Entra a nuestro calendario para que puedas ver los eventos programados y su disponibilidad.</p>
        <Link to="/eventos" className="boton-eventos">¡Participa en nuestros eventos!</Link>
      </div>

      <Carrusel
        className="carrusel-eventos"
        etiquetaAnterior="Evento anterior"
        etiquetaSiguiente="Evento siguiente"
      >
        {eventos.map((evento) => (
          <div className="carrusel-item" key={evento.src}>
            <img src={evento.src} alt={evento.alt} />
          </div>
        ))}
      </Carrusel>
    </section>
  );
}

export default EventosInicio;