import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { EXTRA_CAJITA } from '../data/libros';
import { formatoPrecio } from '../data/menu';
import { obtenerLibros, EVENTO_LIBROS } from '../services/catalogoLibros';
import { API } from '../services/api';

function Libros({ onAgregar }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [vista, setVista] = useState('libro'); // 'libro' | 'caja'
  const dialogRef = useRef(null);
  const [libros, setLibros] = useState(obtenerLibros);

  useEffect(() => {
    const actualizarLibros = () => setLibros(obtenerLibros());

    window.addEventListener(EVENTO_LIBROS, actualizarLibros);

    return () => {
      window.removeEventListener(EVENTO_LIBROS, actualizarLibros);
    };
  }, []);

  useEffect(() => {
    let activo = true;

    API.obtenerLibros()
      .then((librosServidor) => {
        if (activo && librosServidor.length > 0) {
          setLibros(librosServidor);
        }
      })
      .catch((error) => {
        console.error('Error al cargar los libros:', error.message);
      });

    return () => {
      activo = false;
    };
  }, []);

  const idActivo = searchParams.get('libro');
  const libro = libros.find((l) => l.id === idActivo) ?? null;

  useEffect(() => {
    document.title = 'Libros del mes - Blooming';
    return () => { document.title = 'Blooming - Café & Libros'; };
  }, []);

  // Abre o cierra el <dialog> según la URL (?libro=brisas)
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (libro && !dialog.open) {
      setVista('libro');
      dialog.showModal();
    } else if (!libro && dialog.open) {
      dialog.close();
    }
  }, [libro]);

  const abrir = (id) => setSearchParams({ libro: id });
  const cerrar = () => setSearchParams({}, { replace: true });

  const agregar = (opcion) => {
    if (!libro) return;
    const conCajita = opcion === 'cajita';
    const stockDisponible = Number(conCajita ? libro.stockCajita ?? 30 : libro.stockLibro ?? 30);
    if (stockDisponible <= 0) return window.alert('Este producto está agotado.');
    onAgregar?.({ id: `${conCajita ? 'cajita' : 'libro'}-${libro.id}`, nombre: libro.titulo, detalle: conCajita ? 'Con cajita literaria' : 'Solo el libro', precio: libro.precio + (conCajita ? EXTRA_CAJITA : 0), stockDisponible });
    cerrar();
  };

  return (
    <>
      <section className="libros-pagina" aria-labelledby="libros-titulo">
        <header className="libros-intro">
          <h1 id="libros-titulo">Libros del mes</h1>
          <p className="libros-frase">
            <span className="libros-frase-linea">
              Seis libros que no hemos podido dejar de recomendar este mes.
            </span>
            <span className="libros-frase-linea">
              Elige tu próxima lectura y, si quieres, llévatela con su cajita literaria.
            </span>
          </p>
        </header>

        <ul className="libros-lista">
          {libros.map((l) => (
            <li className="libro-tarjeta" key={l.id}>
              <img className="libro-portada" src={l.imagen} alt={`Portada de ${l.titulo}`} />
              <h2 className="libro-titulo">{l.titulo}</h2>
              <p className="libro-autor">{l.autor}</p>
              <button
                type="button"
                className="libro-ver-mas"
                aria-haspopup="dialog"
                aria-label={`Ver más sobre ${l.titulo}`}
                onClick={() => abrir(l.id)}
              >
                Ver más
              </button>
            </li>
          ))}
        </ul>

        <p className="libros-aviso">
          <span className="libros-aviso-linea">
            Si estás buscando nuestra selección literaria completa, solo está disponible en nuestra tienda.
          </span>
          <span className="libros-aviso-linea">¡Visítanos!</span>
        </p>
      </section>

      <dialog
        ref={dialogRef}
        className="panel-libro"
        id="panel-libro"
        aria-labelledby="panel-libro-titulo"
        onClose={cerrar}
        onClick={(e) => {
          const caja = e.currentTarget.getBoundingClientRect();
          const fuera =
            e.clientX < caja.left || e.clientX > caja.right ||
            e.clientY < caja.top || e.clientY > caja.bottom;
          if (fuera) cerrar();
        }}
      >
        {libro && (
          <div className="panel-contenido">
            <button type="button" className="panel-cerrar" aria-label="Cerrar" onClick={cerrar}>
              <i className="ti ti-x" aria-hidden="true"></i>
            </button>

            <div className="panel-visual">
              <div className="panel-diapositiva panel-diapositiva-libro" hidden={vista !== 'libro'}>
                <img className="panel-portada" src={libro.imagen} alt={`Portada de ${libro.titulo}`} />
                <p className="panel-editorial">
                  {libro.editorial} · {libro.paginas} páginas
                </p>
              </div>

              <div className="panel-diapositiva panel-diapositiva-caja" hidden={vista !== 'caja'}>
                <img
                  className="panel-caja-foto"
                  src="/imagenes/cajita-literaria.webp"
                  alt="Cajita literaria de Blooming"
                />
                <div className="panel-caja-info">
                  <h3 className="panel-caja-nombre">
                    {libro.cajaNombre || `Caja literaria: ${libro.titulo}`}
                  </h3>
                  <p className="panel-caja-concepto" hidden={!libro.cajaConcepto}>
                    {libro.cajaConcepto}
                  </p>
                  <ul className="panel-caja-lista">
                    <li>Postal ilustrada y marcapáginas</li>
                    <li>Una vela con aroma pensado para la historia</li>
                    <li>Carta de Blooming y playlist</li>
                    <li>Bono y vale acumulable para el café</li>
                    <li>Una sorpresa de la historia</li>
                  </ul>
                  <p className="panel-caja-aviso">
                    El bono se canjea en nuestro café, en Barranquilla.
                  </p>
                </div>
              </div>

              <div className="panel-puntos">
                <button
                  type="button"
                  className="panel-punto"
                  aria-label="Ver el libro"
                  aria-pressed={vista === 'libro'}
                  onClick={() => setVista('libro')}
                />
                <button
                  type="button"
                  className="panel-punto"
                  aria-label="Ver la cajita literaria"
                  aria-pressed={vista === 'caja'}
                  onClick={() => setVista('caja')}
                />
              </div>
            </div>

            <div className="panel-detalle">
              <img
                className="panel-sello"
                src="/imagenes/sello-club.svg"
                alt="Sello del club de lectura"
                hidden={!libro.club}
              />
              <h2 className="panel-titulo" id="panel-libro-titulo">{libro.titulo}</h2>
              <p className="panel-autor">{libro.autor}</p>

              <div className="panel-sinopsis">
                <h3 className="panel-sinopsis-titulo" id="panel-sinopsis-titulo">Sinopsis</h3>
                <div
                  className="panel-sinopsis-texto"
                  tabIndex={0}
                  role="region"
                  aria-labelledby="panel-sinopsis-titulo"
                >
                  {(libro.sinopsis.length ? libro.sinopsis : ['Próximamente.']).map((parrafo, i) => (
                    <p key={i}>{parrafo}</p>
                  ))}
                </div>
              </div>
                <div className="panel-botones">
                  <button type="button" className="panel-boton" disabled={Number(libro.stockLibro ?? 30) <= 0} onClick={() => agregar('libro')}>
                    <span className="panel-boton-texto">{Number(libro.stockLibro ?? 30) <= 0 ? 'Sin disponibilidad' : 'Solo el libro'}</span>
                    <span className="panel-boton-precio">{formatoPrecio(libro.precio)}</span>
                  </button>
                  <button type="button" className="panel-boton" disabled={Number(libro.stockCajita ?? 30) <= 0} onClick={() => agregar('cajita')}>
                    <span className="panel-boton-texto">{Number(libro.stockCajita ?? 30) <= 0 ? 'Sin disponibilidad' : 'Con cajita'}</span>
                    <span className="panel-boton-precio">{formatoPrecio(libro.precio + EXTRA_CAJITA)}</span>
                  </button>
                </div>
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}

export default Libros;