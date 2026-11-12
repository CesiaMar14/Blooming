
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [correo, setCorreo] = useState('');
  const [clave, setClave] = useState('');
  const [mostrarClave, setMostrarClave] = useState(false);
  const [error, setError] = useState('');

  const ingresar = (e) => {
    e.preventDefault();
    setError('');

    if (!correo.trim() || !clave.trim()) {
      setError('Completa todos los campos para continuar.');
      return;
    }

    // Acceso provisional para visualizar el administrador.
    // La autenticación real se implementará con el backend.
    navigate('/admin/dashboard');
  };

  return (
    <div className="admin-login">
      <form className="admin-login-tarjeta" onSubmit={ingresar}>
        <div className="admin-login-logo">Blooming</div>
        <p className="admin-login-subtitulo">Administración</p>
        <h1>Acceso administrativo</h1>
        <p className="admin-login-texto">Ingresa con tus credenciales para continuar.</p>

        {error && <p className="admin-error" role="alert">{error}</p>}

        <div className="admin-campo">
          <label htmlFor="admin-correo">Correo electrónico</label>
          <input
            id="admin-correo"
            type="email"
            autoComplete="username"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            required
          />
        </div>

        <div className="admin-campo">
          <label htmlFor="admin-clave">Contraseña</label>
          <input
            id="admin-clave"
            type={mostrarClave ? 'text' : 'password'}
            autoComplete="current-password"
            value={clave}
            onChange={(e) => setClave(e.target.value)}
            required
          />
          <label>
            <input
              type="checkbox"
              checked={mostrarClave}
              onChange={(e) => setMostrarClave(e.target.checked)}
            />
            Mostrar contraseña
          </label>
        </div>

        <button type="submit" className="admin-boton">Ingresar</button>
        <a className="admin-login-volver" href="/">Volver a la tienda</a>
      </form>
    </div>
  );
}
