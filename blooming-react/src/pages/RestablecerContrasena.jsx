import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { API } from '../services/api';

export default function RestablecerContrasena() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';

  const [contrasena, setContrasena] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [estado, setEstado] = useState('');
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [exito, setExito] = useState(false);

  const enviar = async (e) => {
    e.preventDefault();
    setEstado('');
    setError('');

    if (!token) {
      setError('El enlace de recuperación no contiene un token válido.');
      return;
    }

    if (contrasena.length < 8 || !/[A-Za-z]/.test(contrasena) || !/\d/.test(contrasena)) {
      setError('Usa al menos 8 caracteres, con letras y números.');
      return;
    }

    if (contrasena !== confirmar) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setEnviando(true);

    try {
      const respuesta = await API.restablecerContrasena({
        token,
        contrasenaNueva: contrasena,
      });

      setEstado(respuesta.mensaje || 'Contraseña actualizada correctamente.');
      setExito(true);
    } catch (err) {
      setError(err.message || 'No fue posible restablecer la contraseña.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <main className="restablecer-vista">
      <section className="restablecer-contenido">
        <h1 className="restablecer-titulo">Restablecer contraseña</h1>

        {exito ? (
          <>
            <p className="restablecer-estado" role="status">{estado}</p>
            <button
              type="button"
              className="restablecer-enviar"
              onClick={() => navigate('/')}
            >
              Volver a Blooming
            </button>
          </>
        ) : (
          <form className="restablecer-formulario" onSubmit={enviar}>
            <p>Escribe y confirma tu nueva contraseña.</p>

            <div className="restablecer-campo">
              <label htmlFor="nueva-contrasena">Nueva contraseña</label>
              <input
                id="nueva-contrasena"
                type="password"
                autoComplete="new-password"
                minLength={8}
                required
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
              />
            </div>

            <div className="restablecer-campo">
              <label htmlFor="confirmar-contrasena">Confirmar contraseña</label>
              <input
                id="confirmar-contrasena"
                type="password"
                autoComplete="new-password"
                required
                value={confirmar}
                onChange={(e) => setConfirmar(e.target.value)}
              />
            </div>

            {error && <p className="restablecer-error" role="alert">{error}</p>}

            <button type="submit" className="restablecer-enviar" disabled={enviando}>
              {enviando ? 'Actualizando...' : 'Guardar nueva contraseña'}
            </button>
          </form>
        )}
      </section>
    </main>
  );
}
