import { Children, useEffect, useRef, useState } from 'react';

function Carrusel({ children, className = '', etiquetaAnterior, etiquetaSiguiente }) {
  const carruselRef = useRef(null);
  const [indice, setIndice] = useState(0);
  const [visibles, setVisibles] = useState(1);
  const total = Children.count(children);

  // Lee --visibles del CSS (cambia según el ancho de pantalla)
  useEffect(() => {
    const leerVisibles = () => {
      const valor = parseInt(
        getComputedStyle(carruselRef.current).getPropertyValue('--visibles'),
        10
      );
      setVisibles(valor || 1);
    };
    leerVisibles();
    window.addEventListener('resize', leerVisibles);
    return () => window.removeEventListener('resize', leerVisibles);
  }, []);

  // Avanza por grupos, como tu script.js
  const paginas = Math.ceil(total / visibles);
  const actual = Math.min(indice, paginas - 1);
  const primero = Math.max(Math.min(actual * visibles, total - visibles), 0);

  const ir = (n) => setIndice((n + paginas) % paginas);

  return (
    <div className={`carrusel ${className}`} ref={carruselRef}>
      <button
        type="button"
        className="carrusel-flecha carrusel-flecha-izq"
        aria-label={etiquetaAnterior}
        onClick={() => ir(actual - 1)}
      >
        <i className="ti ti-chevron-left" aria-hidden="true"></i>
      </button>

      <div className="carrusel-contenedor">
        <div
          className="carrusel-track"
          style={{ transform: `translateX(-${primero * (100 / visibles)}%)` }}
        >
          {children}
        </div>
      </div>

      <button
        type="button"
        className="carrusel-flecha carrusel-flecha-der"
        aria-label={etiquetaSiguiente}
        onClick={() => ir(actual + 1)}
      >
        <i className="ti ti-chevron-right" aria-hidden="true"></i>
      </button>

      <div className="carrusel-indicadores">
        {Array.from({ length: paginas }, (_, i) => (
          <button
            key={i}
            type="button"
            className={`carrusel-indicador ${i === actual ? 'activo' : ''}`}
            aria-label={`Ir al grupo ${i + 1} de ${paginas}`}
            aria-current={i === actual}
            onClick={() => ir(i)}
          />
        ))}
      </div>
    </div>
  );
}

export default Carrusel;