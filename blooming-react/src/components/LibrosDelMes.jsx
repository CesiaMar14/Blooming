import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Carrusel from './Carrusel';
import { obtenerLibros, EVENTO_LIBROS } from '../services/catalogoLibros';

function LibrosDelMes() {
  const [libros, setLibros] = useState(obtenerLibros);

  useEffect(() => {
    const actualizarLibros = () => setLibros(obtenerLibros());

    window.addEventListener(EVENTO_LIBROS, actualizarLibros);

    return () => {
      window.removeEventListener(EVENTO_LIBROS, actualizarLibros);
    };
  }, []);

  return (
    <section id="libros-del-mes" className="libros-del-mes">
      <h2>Libros del mes</h2>
      <p>Libros que no hemos podido dejar de recomendar este mes.</p>
      <p>Explora y encuentra tu próxima lectura.</p>

      <Carrusel
        className="carrusel-libros"
        etiquetaAnterior="Libros anteriores"
        etiquetaSiguiente="Libros siguientes"
      >
        {libros.map((libro) => (
          <article className="carrusel-item" key={libro.id}>
            <img src={libro.imagen} alt={`Portada de ${libro.titulo}`} />
            <h3 className="carrusel-titulo">{libro.titulo}</h3>
            <p className="carrusel-autor">{libro.autor}</p>
            <Link
              to={`/libros?libro=${libro.id}`}
              className="carrusel-enlace"
              aria-label={`Ver más sobre ${libro.titulo}`}
            >
              Ver más
            </Link>
          </article>
        ))}
      </Carrusel>
    </section>
  );
}

export default LibrosDelMes;