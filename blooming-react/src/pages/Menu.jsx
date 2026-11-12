import { useEffect, useState } from 'react';
import Carrusel from '../components/Carrusel';
import Separador from '../components/Separador';
import { formatoPrecio } from '../data/menu';
import { obtenerMenu, EVENTO_MENU } from '../services/catalogoMenu';
import { API } from '../services/api';

function Menu() {
  const [menu, setMenu] = useState(obtenerMenu);

  const { combos, categorias, especiales } = menu;

  useEffect(() => {
    const actualizarMenu = () => setMenu(obtenerMenu());

    window.addEventListener(EVENTO_MENU, actualizarMenu);

    return () => {
      window.removeEventListener(EVENTO_MENU, actualizarMenu);
    };
  }, []);

  useEffect(() => {
    let activo = true;

    API.obtenerMenu()
      .then((menuServidor) => {
        const tieneDatos =
          menuServidor.combos.length > 0 ||
          menuServidor.categorias.length > 0 ||
          menuServidor.especiales.length > 0;

        if (activo && tieneDatos) {
          setMenu(menuServidor);
        }
      })
      .catch((error) => {
        console.error('Error al cargar el menú:', error.message);
      });

    return () => {
      activo = false;
    };
  }, []);

  useEffect(() => {
    document.title = 'Menú - Blooming';
    return () => { document.title = 'Blooming - Café & Libros'; };
  }, []);

  return (
    <>
      <section id="inicio-menu" className="menu-hero">
        <div className="menu-hero-tarjeta">
          <img src="/imagenes/cafetera.png" alt="" className="menu-hero-icono menu-hero-icono-arriba" />

          <h1 className="hero-titulo">
            <span className="hero-el">El</span>
            <span className="hero-menu">Menú</span>
          </h1>
          <p className="menu-hero-lema">Encuentra tu próximo antojo.</p>
          <p className="menu-hero-aviso">Disponible solo en tienda.</p>

          <img src="/imagenes/cafe-croissant.png" alt="" className="menu-hero-icono menu-hero-icono-abajo" />
        </div>
      </section>

      <Separador className="separador-sand" palabras={['Blooming', 'Menú', 'Blooming', 'Menú']} />

      <div className="menu-marco">
        <section id="combos" className="menu-combos">
          <h2>Combos</h2>
          <p className="menu-subtitulo">Duplas que ya probamos por ti, pensadas para estar juntas.</p>

          <Carrusel className="carrusel-combos" etiquetaAnterior="Combos anteriores" etiquetaSiguiente="Combos siguientes">
            {combos.map((combo) => (
              <article className="carrusel-item combo" key={combo.id}>
                <h3 className="combo-nombre">{combo.nombre}</h3>
                <div className="combo-fila">
                  <p className="combo-detalle">{combo.detalle}</p>
                  <span className="menu-item-precio">{formatoPrecio(combo.precio)}</span>
                </div>
              </article>
            ))}
          </Carrusel>
        </section>

        {categorias.map((cat) => (
          <section id={cat.id} className="menu-categoria" key={cat.id}>
            <h2>{cat.titulo}</h2>
            <ul className="menu-lista">
              {cat.items.map((item) => (
                <li className="menu-item" key={item.nombre}>
                  <div className="menu-item-info">
                    <span className="menu-item-nombre">{item.nombre}</span>
                    {item.descripcion && <p className="menu-item-descripcion">{item.descripcion}</p>}
                    {item.etiquetas && <p className="menu-item-etiquetas">{item.etiquetas}</p>}
                  </div>
                  <span className="menu-item-precio">{formatoPrecio(item.precio)}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}

        <section id="especiales" className="menu-categoria">
          <h2>Especiales</h2>
          <p className="menu-subtitulo">Especiales con historia, inspirados en la literatura</p>

          <Carrusel className="carrusel-especiales" etiquetaAnterior="Especiales anteriores" etiquetaSiguiente="Especiales siguientes">
            {especiales.map((e) => (
              <article className="carrusel-item especial" key={e.id}>
                <h3 className="especial-nombre">{e.nombre}</h3>
                <p className="especial-cita">{e.cita}</p>
                <p className="especial-descripcion">{e.descripcion}</p>
                <span className="menu-item-precio">{formatoPrecio(e.precio)}</span>
                {e.etiquetas && <p className="menu-item-etiquetas">{e.etiquetas}</p>}
              </article>
            ))}
          </Carrusel>
        </section>
      </div>
    </>
  );
}

export default Menu;