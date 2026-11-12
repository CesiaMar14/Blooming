import Carrusel from './Carrusel';

const imagenes = [
  { src: '/imagenes/sobre-nosotros-1.webp', alt: 'Salón principal' },
  { src: '/imagenes/sobre-nosotros-2.webp', alt: 'Muro de libros y ventanal' },
  { src: '/imagenes/sobre-nosotros-3.webp', alt: 'Barra de café y vitrina de pastelería' },
  { src: '/imagenes/sobre-nosotros-4.webp', alt: 'Rincón de lectura' },
  { src: '/imagenes/sobre-nosotros-5.webp', alt: 'Fachada y entrada' },
  { src: '/imagenes/sobre-nosotros-6.webp', alt: 'Rincón de decoración y libros' },
];

function SobreNosotros() {
  return (
    <section id="sobre-nosotros" className="sobre-nosotros">
      <div className="sobre-tarjeta">
        <h2>Sobre nosotros</h2>
        <p>
          <span className="nombre-en-texto">Blooming</span> es más que un café o una librería; es un espacio donde la literatura, la cultura y la comunidad se unen. Es un lugar pensado para detenerse, conversar, descubrir un buen libro y disfrutar de un buen café.
        </p>
        <p>
          Está abierto a quien busque una pausa distinta en su día: desde quien llega por una buena taza de café, pasando por quien busca un rincón tranquilo para leer, hasta quien desea participar en nuestros eventos.
        </p>
        <p>
          Nuestro nombre viene del <em lang="en">bloom</em>, ese instante en el que el café recién molido se abre al primer contacto con el agua. Pero también del concepto de florecer, abrirnos a experiencias, sabores y lecturas nuevas para crecer.
        </p>

        <Carrusel
          className="carrusel-sobre-nosotros"
          etiquetaAnterior="Imágenes anteriores"
          etiquetaSiguiente="Imágenes siguientes"
        >
          {imagenes.map((img) => (
            <div className="carrusel-item" key={img.src}>
              <img src={img.src} alt={img.alt} />
            </div>
          ))}
        </Carrusel>
      </div>
    </section>
  );
}

export default SobreNosotros;