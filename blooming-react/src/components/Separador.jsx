function Separador({ palabras = ['Blooming', 'Menú', 'Blooming', 'Eventos'], className = '', grupos = 4 }) {
  return (
    <div className={`separador ${className}`} aria-hidden="true">
      <div className="separador-track" style={{ '--grupos': grupos }}>
        {Array.from({ length: grupos }, (_, g) => (
          <div className="separador-grupo" key={g}>
            {palabras.map((palabra, i) => (
              <span key={i} style={{ display: 'contents' }}>
                <span>{palabra}</span>
                <span className="separador-barra">|</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Separador;