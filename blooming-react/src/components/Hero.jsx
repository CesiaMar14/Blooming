import { portadasHero } from '../data/portadasHero';

function Hero() {
  // Se duplica la lista para el loop infinito de la animación
  const portadasLoop = [...portadasHero, ...portadasHero];

  return (
    <section id="inicio" className="hero">
      <div className="hero-contenido">
        <h1>
          <span className="hero-saludo">Bienvenidos a</span>
          <img src="/imagenes/logo-hero.svg" alt="Blooming, Café & Libros" className="logo-hero" />
        </h1>
        <a href="#libros-del-mes" className="boton">Explora nuestros libros del mes</a>
      </div>

      <div className="hero-portadas" aria-hidden="true">
        <div className="hero-portadas-track">
          {portadasLoop.map((portada, i) => (
            <img key={i} src={portada.src} alt={portada.alt} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default Hero;