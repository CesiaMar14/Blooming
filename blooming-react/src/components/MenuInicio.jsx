import { Link } from 'react-router-dom';

function MenuInicio() {
  return (
    <section id="menu" className="menu-inicio">
      <div className="texto-menu-inicio">
        <h2>Menú</h2>
        <p>Descubre y explora nuestra selección de bebidas, comidas, postres y deliciosos especiales.</p>
        <Link to="/menu" className="boton-menu">Conoce nuestro menú</Link>
      </div>
      <div className="imagenes-menu-inicio">
        <img src="/imagenes/menu-1.webp" alt="Dos amigas con croissant y capuchino" />
        <img src="/imagenes/menu-2.webp" alt="Mesa vista desde arriba" />
        <img src="/imagenes/menu-3.webp" alt="Brunch en grupo" />
      </div>
    </section>
  );
}

export default MenuInicio;