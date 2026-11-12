import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { buscarEnBlooming } from '../utils/busqueda';

function Header({
  paginaActiva = 'inicio',
  cuenta,
  cantidadCarrito = 0,
  carritoAbierto = false,
  onAbrirCuenta,
  onAbrirCarrito,
}) {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [consulta, setConsulta] = useState('');
  const [busquedaAbierta, setBusquedaAbierta] = useState(false);
  const botonMenuRef = useRef(null);
  const menuRef = useRef(null);
  const buscadorRef = useRef(null);
  const navigate = useNavigate();
  const inputBusquedaRef = useRef(null);

  const resultados = buscarEnBlooming(consulta);

  const cerrarMenu = () => {
    setMenuAbierto(false);
    botonMenuRef.current?.focus();
  };

  const seleccionarResultado = (destino) => {
    navigate(destino);
    setConsulta('');
    setBusquedaAbierta(false);
  };

  const realizarBusqueda = (event) => {
    event.preventDefault();

    if (resultados.length > 0) {
      seleccionarResultado(resultados[0].destino);
    }
  };

  const limpiarBusqueda = () => {
    setConsulta('');
    setBusquedaAbierta(false);
    inputBusquedaRef.current?.focus();
  };

  useEffect(() => {
    if (!menuAbierto) return;

    menuRef.current?.querySelector('a')?.focus();

    const manejarTeclado = (event) => {
      if (event.key === 'Escape') cerrarMenu();
    };

    document.addEventListener('keydown', manejarTeclado);
    return () => document.removeEventListener('keydown', manejarTeclado);
  }, [menuAbierto]);

  useEffect(() => {
    const manejarClickExterior = (event) => {
      if (!buscadorRef.current?.contains(event.target)) {
        setBusquedaAbierta(false);
      }
    };

    document.addEventListener('mousedown', manejarClickExterior);

    return () => {
      document.removeEventListener('mousedown', manejarClickExterior);
    };
  }, []);

  const paginaActual = (pagina) =>
    paginaActiva === pagina ? 'page' : undefined;

  const tab = menuAbierto ? 0 : -1;

  return (
    <header>
      <button
        ref={botonMenuRef}
        type="button"
        className="menu-hamburguesa"
        aria-label={menuAbierto ? 'Cerrar menú' : 'Abrir menú'}
        aria-expanded={menuAbierto}
        aria-controls="menu-desplegable"
        onClick={() => setMenuAbierto(!menuAbierto)}
      >
        <i className="ti ti-menu-2" aria-hidden="true"></i>
      </button>

      <Link to="/" className="encabezado-marca">
        <img src="/imagenes/logo-header.svg" alt="Blooming" className="logo-header" />
      </Link>

      <form
        ref={buscadorRef}
        className="buscador"
        role="search"
        onSubmit={realizarBusqueda}
      >
        <button type="submit" className="buscador-boton" aria-label="Buscar">
          <i className="ti ti-search" aria-hidden="true"></i>
        </button>

        <label htmlFor="buscar" className="sr-only">
          Buscar en el sitio
        </label>

        <input
          ref={inputBusquedaRef}
          type="search"
          id="buscar"
          name="buscar"
          placeholder="Buscar..."
          value={consulta}
          autoComplete="off"
          onChange={(event) => {
            setConsulta(event.target.value);
            setBusquedaAbierta(true);
          }}
          onFocus={() => {
            if (consulta.trim()) setBusquedaAbierta(true);
          }}
          aria-expanded={busquedaAbierta && consulta.trim().length > 0}
          aria-controls="resultados-busqueda"
        />

        {consulta && (
          <button
            type="button"
            className="buscador-limpiar"
            aria-label="Limpiar búsqueda"
            onClick={limpiarBusqueda}
          >
            <i className="ti ti-x" aria-hidden="true"></i>
          </button>
        )}

        {busquedaAbierta && consulta.trim().length > 0 && (
          <div
            className="resultados-busqueda"
            id="resultados-busqueda"
            role="listbox"
          >
            {resultados.length > 0 ? (
              resultados.map((resultado) => (
                <button
                  key={resultado.id}
                  type="button"
                  className="resultado-busqueda"
                  role="option"
                  aria-selected="false"
                  onClick={() => seleccionarResultado(resultado.destino)}
                >
                  <span className="resultado-tipo">{resultado.tipo}</span>
                  <strong>{resultado.titulo}</strong>
                  <span className="resultado-detalle">{resultado.detalle}</span>
                </button>
              ))
            ) : (
              <p className="busqueda-sin-resultados">
                No encontramos resultados para «{consulta}».
              </p>
            )}
          </div>
        )}
      </form>

      <nav className="nav-principal" aria-label="Navegación principal">
        <ul>
          <li>
            <Link to="/menu" aria-current={paginaActual('menu')}>
              <i className="ti ti-tools-kitchen-2" aria-hidden="true"></i> Menú
            </Link>
          </li>
          <li>
            <Link to="/libros" aria-current={paginaActual('libros')}>
              <i className="ti ti-books" aria-hidden="true"></i> Libros del mes
            </Link>
          </li>
          <li>
            <Link to="/eventos" aria-current={paginaActual('eventos')}>
              <i className="ti ti-calendar-event" aria-hidden="true"></i> Eventos
            </Link>
          </li>
          <li>
            <Link to="/#contacto">
              <i className="ti ti-mail" aria-hidden="true"></i> Contacto
            </Link>
          </li>
        </ul>
      </nav>

      <div className="encabezado-iconos">
        <button type="button" className="cuenta-boton" aria-label="Mi cuenta" onClick={onAbrirCuenta}>
          <i className="ti ti-user" aria-hidden="true"></i>
        </button>

        <button
          type="button"
          className="carrito-boton"
          aria-label="Abrir carrito"
          aria-expanded={carritoAbierto}
          aria-controls="carrito-panel"
          onClick={onAbrirCarrito}
        >
          <i className="ti ti-shopping-cart" aria-hidden="true"></i>
          <span className="carrito-contador">{cantidadCarrito}</span>
        </button>
      </div>

      <nav
        ref={menuRef}
        className={`menu-desplegable ${menuAbierto ? 'abierto' : ''}`}
        id="menu-desplegable"
        aria-label="Menú desplegable"
        onClick={(event) => {
          if (event.target === event.currentTarget) cerrarMenu();
        }}
      >
        <button
          type="button"
          className="cerrar-menu"
          aria-label="Cerrar menú"
          onClick={cerrarMenu}
          tabIndex={tab}
        >
          <i className="ti ti-x" aria-hidden="true"></i>
        </button>

        <ul>
          <li><Link to="/" aria-current={paginaActual('inicio')} tabIndex={tab} onClick={cerrarMenu}>Inicio</Link></li>
          <li><Link to="/libros" aria-current={paginaActual('libros')} tabIndex={tab} onClick={cerrarMenu}>Libros del mes</Link></li>
          <li><Link to="/menu" aria-current={paginaActual('menu')} tabIndex={tab} onClick={cerrarMenu}>Menú</Link></li>
          <li><Link to="/eventos" aria-current={paginaActual('eventos')} tabIndex={tab} onClick={cerrarMenu}>Eventos</Link></li>
          <li><Link to="/#sobre-nosotros" tabIndex={tab} onClick={cerrarMenu}>Sobre nosotros</Link></li>
          <li><Link to="/#contacto" tabIndex={tab} onClick={cerrarMenu}>Contacto</Link></li>
          {cuenta?.rol === 'admin' && (
            <li>
              <Link
                to="/admin/dashboard"
                tabIndex={tab}
                onClick={cerrarMenu}
              >
                Administración
              </Link>
            </li>
          )}
        </ul>
      </nav>
    </header>
  );
}

export default Header;