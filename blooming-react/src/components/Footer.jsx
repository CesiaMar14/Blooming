function Footer() {
  return (
    <footer>
      <div className="footer-marca">
        <img
          src="/imagenes/logo-footer.svg"
          alt="Blooming, Café & Libros"
          className="footer-logo"
        />
        <p>Donde el café y las buenas historias se encuentran.</p>
      </div>

      <div className="footer-redes">
        <a
          href="https://instagram.com/blooming"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram"
        >
          <i className="ti ti-brand-instagram" aria-hidden="true"></i>
        </a>
        <a
          href="https://wa.me/573001234567"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="WhatsApp"
        >
          <i className="ti ti-brand-whatsapp" aria-hidden="true"></i>
        </a>
        <a href="mailto:info@blooming.com" aria-label="Correo electrónico">
          <i className="ti ti-mail" aria-hidden="true"></i>
        </a>
      </div>

      <p className="footer-direccion">
        <i className="ti ti-map-pin-2" aria-hidden="true"></i> Carrera 74 #30 12,
        Barranquilla, Colombia.
      </p>

      <p className="footer-copy">
        © 2026 Blooming, Café & Libros. Todos los derechos reservados.
      </p>
    </footer>
  );
}

export default Footer;
