import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { obtenerLibros, EVENTO_LIBROS } from '../services/catalogoLibros';
import { formatoPrecio } from '../data/menu';
import {
  PRECIO_CLUB,
  MES_INICIAL,
  MES_FINAL,
} from '../data/eventos';
import {
  obtenerEventos,
  EVENTO_EVENTOS,
} from '../services/catalogoEventos';
import { API } from '../services/api';

const DIAS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const mayuscula = (t) => t.charAt(0).toUpperCase() + t.slice(1);
const pad = (n) => String(n).padStart(2, '0');
const clave = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const aFecha = (texto) => {
  const [y, m, d] = texto.split('-').map(Number);
  return new Date(y, m - 1, d);
};

// Lista de meses entre MES_INICIAL y MES_FINAL
const MESES = (() => {
  const [yi, mi] = MES_INICIAL.split('-').map(Number);
  const [yf, mf] = MES_FINAL.split('-').map(Number);
  const lista = [];
  for (let y = yi, m = mi; y < yf || (y === yf && m <= mf); m === 12 ? (y++, (m = 1)) : m++) {
    lista.push({ year: y, month: m - 1 });
  }
  return lista;
})();

function celdasDelMes({ year, month }) {
  const primero = new Date(year, month, 1);
  const diasMes = new Date(year, month + 1, 0).getDate();
  const total = Math.ceil((primero.getDay() + diasMes) / 7) * 7;
  return Array.from({ length: total }, (_, i) => {
    const fecha = new Date(year, month, 1 - primero.getDay() + i);
    return { fecha, fuera: fecha.getMonth() !== month };
  });
}

function estadoCupos(cupos) {
  if (cupos === 0) return { texto: 'Agotado', pocos: true };
  if (cupos !== undefined && cupos <= 5) return { texto: 'Pocos cupos', pocos: true };
  return { texto: 'Cupos disponibles', pocos: false };
}

function Eventos({ onAgregar }) {
  const [indiceMes, setIndiceMes] = useState(0);
  const [seleccion, setSeleccion] = useState(null); // 'YYYY-MM-DD'
  const clubRef = useRef(null);
  const [libros, setLibros] = useState(obtenerLibros);
  const [eventos, setEventos] = useState(obtenerEventos);
  const [ahora, setAhora] = useState(() => Date.now());

  useEffect(() => {
    const intervalo = setInterval(() => setAhora(Date.now()), 1000);
    return () => clearInterval(intervalo);
  }, []);

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

  useEffect(() => {
    const actualizarEventos = () => setEventos(obtenerEventos());

    window.addEventListener(EVENTO_EVENTOS, actualizarEventos);

    return () => {
      window.removeEventListener(EVENTO_EVENTOS, actualizarEventos);
    };
  }, []);

  useEffect(() => {
    let activo = true;

    API.obtenerEventos()
      .then((eventosServidor) => {
        if (activo && eventosServidor.length > 0) {
          setEventos(eventosServidor);
        }
      })
      .catch((error) => {
        console.error('Error al cargar los eventos:', error.message);
      });

    return () => {
      activo = false;
    };
  }, []);

  useEffect(() => {
    document.title = 'Eventos - Blooming';
    return () => { document.title = 'Blooming - Café & Libros'; };
  }, []);

  const mes = MESES[indiceMes];
  const tituloMes = mayuscula(
    new Date(mes.year, mes.month, 1).toLocaleDateString('es-CO', { month: 'long', year: 'numeric' })
  );
  const porFecha = Object.fromEntries(eventos.map((e) => [e.fecha, e]));
  const evento = seleccion ? porFecha[seleccion] : null;

  const abrirClub = () => clubRef.current?.showModal();
  const cerrarClub = () => clubRef.current?.close();

  const agregar = (producto) => onAgregar?.(producto);

  function Detalle() {
    if (!evento) {
      return (
        <>
          <h2>Información</h2>
          <p>Presiona alguna de nuestras fechas para ver más información.</p>
        </>
      );
    }

    const esClub = evento.tipo === 'club';
    const libro = esClub ? libros.find((l) => l.id === evento.libroId) : null;

    if (esClub && !libro) {
      return (
        <>
          <h2>Información</h2>
          <h3 className="evento-titulo">Club de Lectura</h3>
          <p>Próximamente.</p>
          <p>Presiona las fechas con sello para ver los otros eventos.</p>
        </>
      );
    }

    const fecha = mayuscula(
      aFecha(evento.fecha).toLocaleDateString('es-CO', {
        weekday: 'long', day: 'numeric', month: 'long',
      })
    );
    const nombreMes = mayuscula(
      aFecha(evento.fecha).toLocaleDateString('es-CO', { month: 'long' })
    );
    const cupos = estadoCupos(evento.cupos);
    const agotado = evento.cupos === 0;
    const fechaFinEvento = new Date(
      `${evento.fecha}T${evento.hora ? `${evento.hora}:00` : '23:59:59'}-05:00`
    );
    const finalizado = Number.isNaN(fechaFinEvento.getTime()) || ahora >= fechaFinEvento.getTime();
    const conPrecio = evento.precio > 0;

    // Reuniones del club + lo demás que incluye
    const incluye = [

      ...(evento.reuniones ?? []).map(
        (r) =>
          `${r.tipo === 'virtual' ? 'Reunión virtual' : 'Reunión presencial'}: ${mayuscula(
            aFecha(r.fecha).toLocaleDateString('es-CO', { day: 'numeric', month: 'long' })
          )} · ${r.hora} h · ${r.duracion}`
      ),
      ...(evento.incluye ?? []),
    ];

    const sello = esClub ? '/imagenes/sello-club.svg' : '/imagenes/sello-eventos.svg';
    const idCarrito = esClub ? `club-${evento.fecha}` : `evento-${evento.fecha}`;
    const nombreCarrito = esClub ? `Club de Lectura - ${nombreMes}` : evento.titulo;

    return (
      <>
        <div className="info-cabecera">
          <h2>Información</h2>
          <span className={`estado-cupos ${cupos.pocos ? 'estado-cupos-pocos' : ''}`}>{cupos.texto}</span>
          <img className="info-sello" src={sello} alt="" />
        </div>

        <article className="evento-detalle">
          <h3 className="evento-titulo">{evento.titulo}</h3>

          <ul className="evento-datos">
            <li>
              <i className="ti ti-calendar" aria-hidden="true"></i>
              <time dateTime={evento.fecha}>{fecha}</time>
            </li>
            {evento.hora && (
              <li>
                <i className="ti ti-clock" aria-hidden="true"></i>
                <span>{evento.hora} h{evento.duracion && ` · ${evento.duracion}`}</span>
              </li>
            )}
            {evento.lugar && (
              <li>
                <i className="ti ti-map-pin" aria-hidden="true"></i>
                <span>{evento.lugar}</span>
              </li>
            )}
            {evento.cupos !== undefined && (
              <li>
                <i className="ti ti-users" aria-hidden="true"></i>
                <span>{agotado ? 'Sin cupos' : `Cupo de ${evento.cupos} personas`}</span>
              </li>
            )}
          </ul>

          <div className="evento-cuerpo">
            <figure className="evento-media">
              {esClub ? (
                <>
                  <img src={libro.imagen} alt={`Portada de ${libro.titulo}`} />
                  <figcaption>
                    <strong>{libro.titulo}</strong>
                    <span>{libro.autor}</span>
                  </figcaption>
                </>
              ) : (
                <>
                  <img src={evento.imagen} alt="" />
                  {evento.dirige && (
                    <figcaption>
                      <strong>{evento.dirige}</strong>
                      <span>Dirige el taller</span>
                    </figcaption>
                  )}
                </>
              )}
            </figure>

            <div className="evento-texto">
              {esClub && evento.lectura && <p>{evento.lectura}</p>}
              {evento.descripcion?.map((parrafo, i) => (
                <p key={i}>{parrafo}</p>
              ))}

              {incluye.length > 0 && (
                <>
                  <h4 className="evento-incluye-titulo">Incluye</h4>
                  <ul className="evento-incluye">
                    {incluye.map((item) => (
                      <li key={item}>
                        <i className="ti ti-check" aria-hidden="true"></i>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </div>

          <div className="evento-pie">
            {conPrecio && (
              <p className="evento-precio">
                {formatoPrecio(evento.precio)}
                <span>por persona</span>
              </p>
            )}

            <div className="evento-acciones">
              {esClub && (
                <Link className="boton-evento" to={`/libros?libro=${libro.id}`}>
                  Ver más del libro
                </Link>
              )}
              {conPrecio && (
                <button
                  type="button"
                  className="boton-carrito-evento"
                  disabled={agotado || finalizado}
                  onClick={() => agregar({
                    id: idCarrito,
                    nombre: nombreCarrito,
                    precio: evento.precio,
                    tipo: 'evento',
                    eventoId: evento.id,
                    fechaEvento: evento.fecha,
                    horaEvento: evento.hora || '',
                    lugarEvento: evento.lugar || '',
                    tituloEvento: evento.titulo,
                  })}
                >
                  {finalizado ? 'Evento finalizado' : agotado ? 'Agotado' : 'Agregar al carrito'}
                </button>
              )}
            </div>
          </div>
        </article>
      </>
    );
  }

  return (
    <>
      <section className="eventos-intro">
        <h1 id="eventos-titulo">Eventos</h1>
        <p>Mira, escoge y disfruta de nuestras diferentes actividades.</p>
        <p>¡Te esperamos, solo faltas tú!</p>
      </section>

      <div className="eventos-contenido">
        <div className="eventos-info" id="dia-detalle" aria-live="polite">
          {Detalle()}
        </div>

        <div className="eventos-calendario-columna" id="calendario">
          <div className="calendario-nav">
            <button
              type="button"
              className="calendario-flecha"
              aria-label="Mes anterior"
              disabled={indiceMes === 0}
              onClick={() => setIndiceMes((i) => i - 1)}
            >
              <i className="ti ti-chevron-left" aria-hidden="true"></i>
            </button>
            <h2 className="calendario-titulo" id="calendario-titulo" aria-live="polite">{tituloMes}</h2>
            <button
              type="button"
              className="calendario-flecha"
              aria-label="Mes siguiente"
              disabled={indiceMes === MESES.length - 1}
              onClick={() => setIndiceMes((i) => i + 1)}
            >
              <i className="ti ti-chevron-right" aria-hidden="true"></i>
            </button>
          </div>

          <div className="eventos-calendario">
            <div className="calendario-mes" role="group" aria-labelledby="calendario-titulo">
              {DIAS.map((d) => (
                <div className="calendario-dia-semana" key={d}>{d}</div>
              ))}

              {celdasDelMes(mes).map(({ fecha, fuera }) => {
                const k = clave(fecha);
                const ev = porFecha[k];
                const clases = `calendario-dia ${fuera ? 'calendario-dia-fuera' : ''} ${
                  ev ? 'calendario-dia-evento' : ''
                } ${k === seleccion ? 'calendario-dia-activo' : ''}`;
                const contenido = (
                  <>
                    <span className="calendario-numero">{fecha.getDate()}</span>
                    {ev && (
                      <img
                        className="calendario-sello"
                        src={ev.tipo === 'club' ? '/imagenes/sello-club.svg' : '/imagenes/sello-eventos.svg'}
                        alt=""
                      />
                    )}
                  </>
                );

                if (!ev) return <div className={clases} key={k}>{contenido}</div>;

                const etiqueta = `${ev.tipo === 'club' ? 'Club de lectura' : ev.titulo}, ${fecha.toLocaleDateString('es-CO', { day: 'numeric', month: 'long' })}`;
                return (
                  <button
                    type="button"
                    className={clases}
                    key={k}
                    aria-label={etiqueta}
                    aria-pressed={k === seleccion}
                    onClick={() => setSeleccion(k)}
                  >
                    {contenido}
                  </button>
                );
              })}
            </div>
          </div>

          <ul className="calendario-leyenda">
            <li>
              <img src="/imagenes/sello-club.svg" alt="Sello de club de lectura" />
              <span>Club de lectura</span>
              <button
                type="button"
                className="boton-evento boton-como"
                aria-haspopup="dialog"
                aria-controls="club-metodologia"
                onClick={abrirClub}
              >
                ¿Cómo funciona?
              </button>
            </li>
            <li>
              <img src="/imagenes/sello-eventos.svg" alt="Sello de evento" />
              <span>Otros eventos</span>
            </li>
          </ul>
        </div>
      </div>

      <dialog
        ref={clubRef}
        className="panel-club"
        id="club-metodologia"
        aria-labelledby="club-titulo"
        onClick={(e) => {
          const caja = e.currentTarget.getBoundingClientRect();
          const fuera =
            e.clientX < caja.left || e.clientX > caja.right ||
            e.clientY < caja.top || e.clientY > caja.bottom;
          if (fuera) cerrarClub();
        }}
      >
        <div className="panel-club-contenido">
          <button type="button" className="panel-cerrar" aria-label="Cerrar" onClick={cerrarClub}>
            <i className="ti ti-x" aria-hidden="true"></i>
          </button>

          <h2 id="club-titulo">¿Cómo funciona el club de lectura?</h2>

          <ol className="club-pasos">
            <li>
              <h3>Un libro al mes</h3>
              <p>Cada mes Blooming escoge un libro y la lectura empieza el primer día de cada mes.</p>
            </li>
            <li>
              <h3>Metas semanales</h3>
              <p>Ponemos una meta de lectura por semana y vamos conversando sobre el libro en un grupo de WhatsApp.</p>
            </li>
            <li>
              <h3>Primera reunión, virtual</h3>
              <p>El día 15 nos encontramos en línea durante 2 horas para comentar cómo va el libro y compartir nuestras reflexiones.</p>
            </li>
            <li>
              <h3>Reunión final, en Blooming</h3>
              <p>El último sábado del mes nos vemos en nuestras instalaciones durante 2 horas, con aperitivos de café, té, galletas y torta, para conversar sobre todo el libro.</p>
            </li>
          </ol>

          <p className="club-inscripcion">
            La inscripción cuesta {formatoPrecio(PRECIO_CLUB)} y el cupo es de 25 personas.
            Cuando te inscribes, te confirmamos por correo con todos los detalles del club y de la lectura.
          </p>

          <p className="club-comprar">
            El libro no está incluido en la inscripción, pero puedes comprarlo con nosotros.
            <Link to="/libros" onClick={cerrarClub}>Mira los libros del mes</Link>
          </p>
        </div>
      </dialog>
    </>
  );
}

export default Eventos;