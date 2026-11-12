import { useEffect, useRef, useState } from 'react';
import { formatoPrecio } from '../data/menu';
import { EDAD_MINIMA, VALOR_PUNTO } from '../config';
import { MODO_PRUEBA, API } from '../services/api';

const limpiarTelefono = (v) => v.replace(/\D/g, '').replace(/^57(?=3\d{9}$)/, '');

function calcularEdad(valor) {
  if (!valor) return null;

  const partes = valor.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (!partes) return null;

  const anio = Number(partes[1]);
  const mes = Number(partes[2]);
  const dia = Number(partes[3]);

  const fecha = new Date(anio, mes - 1, dia);

  // Comprueba que JavaScript no haya corregido una fecha imposible.
  if (
    fecha.getFullYear() !== anio ||
    fecha.getMonth() !== mes - 1 ||
    fecha.getDate() !== dia
  ) {
    return null;
  }

  const hoy = new Date();

  let edad = hoy.getFullYear() - anio;
  const cumple = new Date(hoy.getFullYear(), mes - 1, dia);

  if (hoy < cumple) edad--;

  return edad;
}

function validarNacimiento(valor) {
  if (!valor) return 'Escribe tu fecha de nacimiento.';
  const edad = calcularEdad(valor);

  if (edad === null || edad < 0) {
    return 'Escribe una fecha de nacimiento válida.';
  }
  if (edad < EDAD_MINIMA) {
    return `Debes tener al menos ${EDAD_MINIMA} años para crear una cuenta.`;
  }
}

const REGLA_CORREO = (v) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? '' : 'Escribe un correo válido, por ejemplo nombre@correo.com.';

const REGLAS_ENTRAR = {
  correo: REGLA_CORREO,
  contrasena: (v) => (v ? '' : 'Escribe tu contraseña.'),
};

const REGLAS_CREAR = {
  nombre: (v) => (v.trim().length >= 3 ? '' : 'Escribe tu nombre completo.'),
  correo: REGLA_CORREO,
  celular: (v) => (/^3\d{9}$/.test(limpiarTelefono(v)) ? '' : 'Escribe un celular de 10 dígitos.'),
  nacimiento: validarNacimiento,
  documento: (v) => (/^\d{6,10}$/.test(v.replace(/[.\s]/g, '')) ? '' : 'Escribe tu documento solo con números (de 6 a 10 dígitos).'),
  contrasena: (v) => (v.length >= 8 && /[A-Za-z]/.test(v) && /\d/.test(v) ? '' : 'Usa al menos 8 caracteres, con letras y números.'),
  autorizacion: (marcada) => (marcada ? '' : 'Debes aceptar el tratamiento de tus datos para crear la cuenta.'),
  autorizacionTutor: (marcada, form) => {
  const edad = calcularEdad(form.elements.nacimiento.value);

  return edad !== null && edad >= 13 && edad < 18 && !marcada
    ? 'Necesitas la autorización de tu padre, madre o tutor.'
    : '';
  },
};

const CAMPOS_ENTRAR = [
  { name: 'correo', label: 'Correo electrónico', type: 'email', autoComplete: 'email' },
  { name: 'contrasena', label: 'Contraseña', type: 'password', autoComplete: 'current-password' },
];

const CAMPOS_CREAR = [
  { name: 'nombre', label: 'Nombre completo', type: 'text', autoComplete: 'name' },
  { name: 'correo', label: 'Correo electrónico', type: 'email', autoComplete: 'email' },
  { name: 'celular', label: 'Número de celular', type: 'tel', autoComplete: 'tel', inputMode: 'tel' },
{
  name: 'genero',
  label: 'Género',
  type: 'select',
  options: [
    { value: '', label: 'Selecciona una opción' },
    { value: 'femenino', label: 'Femenino' },
    { value: 'masculino', label: 'Masculino' },
    { value: 'otro', label: 'Otro' },
    { value: 'prefiero_no_decir', label: 'Prefiero no decirlo' },
  ],
},
  { name: 'nacimiento', label: 'Fecha de nacimiento', type: 'date', autoComplete: 'bday' },
  { name: 'documento', label: 'Documento de identidad', type: 'text', inputMode: 'numeric', autoComplete: 'off' },
  { name: 'contrasena', label: 'Contraseña', type: 'password', autoComplete: 'new-password' },
];

function validar(form, reglas) {
  const errores = {};
  let primero = null;
  for (const [nombre, regla] of Object.entries(reglas)) {
    const campo = form.elements[nombre];
    const valor = campo.type === 'checkbox' ? campo.checked : campo.value;
    const mensaje = regla(valor, form);
    errores[nombre] = mensaje;
    if (mensaje && !primero) primero = campo;
  }
  return { errores, primero };
}

function DialogoCuenta({ abierto, aviso, onCerrar, tienda, onIrMiCuenta }) {
  const { cuenta, iniciarSesion, crearCuenta, cerrarSesion } = tienda;
  const dialogRef = useRef(null);
  const [pestana, setPestana] = useState('entrar');
  const [errores, setErrores] = useState({});
  const [estado, setEstado] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [edadRegistro, setEdadRegistro] = useState(null);
  const [recuperando, setRecuperando] = useState(false);

  // Abre o cierra el <dialog> según la prop
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (abierto && !dialog.open) {
      setPestana('entrar');
      setErrores({});
      setEstado('');
      dialog.showModal();
    } else if (!abierto && dialog.open) {
      dialog.close();
    }
  }, [abierto]);

  const elegirPestana = (nombre) => {
    setPestana(nombre);
    setRecuperando(false);
    setErrores({});
    setEstado('');
  };

  const alEscribir = (e) => {
    if (e.target.name) {
      setErrores((actual) => ({ ...actual, [e.target.name]: '' }));
    }

    if (e.target.name === 'nacimiento') {
      setEdadRegistro(calcularEdad(e.target.value));
    }
  };

  async function enviar(e, reglas, accion) {
    e.preventDefault();
    const form = e.currentTarget;
    const { errores: nuevos, primero } = validar(form, reglas);
    setErrores(nuevos);
    if (primero) {
      primero.focus();
      return;
    }

    setEstado('');
    setEnviando(true);
    try {
      await accion(form.elements);
      form.reset();
      onCerrar();
    } catch (error) {
      setEstado(error.message);
    } finally {
      setEnviando(false);
    }
  }

  const entrar = (e) =>
  enviar(e, REGLAS_ENTRAR, (c) =>
    iniciarSesion({
      correo: c.correo.value.trim().toLowerCase(),
      contrasena: c.contrasena.value,
    })
  );

  const recuperarContrasena = async (e) => {
    e.preventDefault();

    const form = e.currentTarget;
    const correo = form.elements.correo.value.trim().toLowerCase();
    const errorCorreo = REGLA_CORREO(correo);

    setErrores({ correo: errorCorreo });

    if (errorCorreo) return;

    setEnviando(true);
    setEstado('');

    try {
      const respuesta = await API.solicitarRecuperacion(correo);
      setEstado(
        respuesta.mensaje || 'Si el correo está registrado, recibirás un enlace de recuperación.'
      );
      form.reset();
    } catch (error) {
      setEstado(error.message || 'No fue posible enviar el enlace.');
    } finally {
      setEnviando(false);
    }
  };

  const crear = (e) =>
    enviar(e, REGLAS_CREAR, (c) =>
      crearCuenta({
        nombre: c.nombre.value.trim(),
        correo: c.correo.value.trim().toLowerCase(),
        celular: limpiarTelefono(c.celular.value),
        genero: c.genero.value,
        fechaNacimiento: c.nacimiento.value,
        documento: c.documento.value.replace(/[.\s]/g, ''),
        contrasena: c.contrasena.value,
      })
    );

  const salir = async () => {
    await cerrarSesion();
    onCerrar();
  };

  const renderCampos = (campos, prefijo) =>
    campos.map((c) => (
      <div className="cuenta-campo" key={c.name}>
        <label htmlFor={`${prefijo}-${c.name}`}>{c.label}</label>
        {c.type === 'select' ? (
          <select
            id={`${prefijo}-${c.name}`}
            name={c.name}
            defaultValue=""
            aria-describedby={`${prefijo}-${c.name}-error`}
            aria-invalid={errores[c.name] ? 'true' : 'false'}
          >
            {c.options.map((opcion) => (
              <option key={opcion.value} value={opcion.value}>
                {opcion.label}
              </option>
            ))}
          </select>
        ) : (
          <input
            id={`${prefijo}-${c.name}`}
            name={c.name}
            type={c.type}
            autoComplete={c.autoComplete}
            inputMode={c.inputMode}
            aria-describedby={`${prefijo}-${c.name}-error`}
            aria-invalid={errores[c.name] ? 'true' : 'false'}
          />
        )}
        <p className="cuenta-error" id={`${prefijo}-${c.name}-error`}>{errores[c.name]}</p>
      </div>
    ));

  return (
    <dialog
      ref={dialogRef}
      className="panel-cuenta"
      id="dialogo-cuenta"
      aria-labelledby="cuenta-titulo"
      onClose={() => {
        if (abierto) onCerrar();
      }}
    >
      <div className="cuenta-contenido">
        <button type="button" className="panel-cerrar cuenta-cerrar" aria-label="Cerrar" onClick={onCerrar}>
          <i className="ti ti-x" aria-hidden="true"></i>
        </button>

        <h2 className="cuenta-titulo" id="cuenta-titulo">
          {cuenta ? 'Mi cuenta' : 'Tu cuenta'}
        </h2>
        {aviso && <p className="cuenta-aviso">{aviso}</p>}
        {MODO_PRUEBA && (
          <p className="cuenta-prueba">
            Modo de prueba: las cuentas y las contraseñas se almacenan localmente en este navegador. La recuperación no envía correos electrónicos.
          </p>
        )}

        {!cuenta ? (
          <div className="cuenta-vista" data-vista="acceso">
            <div className="cuenta-pestanas" role="group" aria-label="Elige una opción">
              <button type="button" className="cuenta-pestana" aria-pressed={pestana === 'entrar'} onClick={() => elegirPestana('entrar')}>
                Iniciar sesión
              </button>
              <button type="button" className="cuenta-pestana" aria-pressed={pestana === 'crear'} onClick={() => elegirPestana('crear')}>
                Crear cuenta
              </button>
            </div>

            {recuperando ? (
              <form
                className="cuenta-formulario"
                noValidate
                onSubmit={recuperarContrasena}
                onInput={alEscribir}
              >

              <p>Escribe tu correo electrónico y te enviaremos un enlace para recuperar tu contraseña.</p>

              <div className="cuenta-campo">
                <label htmlFor="recuperar-correo">Correo electrónico</label>
                <input
                  id="recuperar-correo"
                  name="correo"
                  type="email"
                  autoComplete="email"
                  required
                  aria-invalid={errores.correo ? 'true' : 'false'}
                />
                <p className="cuenta-error">{errores.correo}</p>
              </div>

              <p className="cuenta-estado" role="alert">{estado}</p>

              <button type="submit" className="cuenta-enviar" disabled={enviando}>
                {enviando ? 'Enviando...' : 'Enviar enlace de recuperación'}
              </button>

                <button
                  type="button"
                  className="cuenta-enlace"
                  onClick={() => {
                    setRecuperando(false);
                    setErrores({});
                    setEstado('');
                  }}

                >
                  Volver a iniciar sesión
                </button>
              </form>
            ) : pestana === 'entrar' ? (
              <form className="cuenta-formulario" noValidate onSubmit={entrar} onInput={alEscribir}>
                {renderCampos(CAMPOS_ENTRAR, 'entrar')}
                  <button
                    type="button"
                    className="cuenta-enlace"
                    onClick={() => {
                      setRecuperando(true);
                      setErrores({});
                      setEstado('');
                    }}
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                  <p className="cuenta-estado" role="alert">{estado}</p>
                <button type="submit" className="cuenta-enviar" disabled={enviando}>Entrar</button>
              </form>
            ) : (
              <form className="cuenta-formulario" noValidate onSubmit={crear} onInput={alEscribir}>
                {renderCampos(CAMPOS_CREAR, 'crear')}
                <div className="cuenta-campo" id="crear-campo-tutor" hidden={edadRegistro === null || edadRegistro < 13 || edadRegistro >= 18}>
                  <label className="cuenta-casilla">
                    <input
                      type="checkbox"
                      id="crear-autorizacion-tutor"
                      name="autorizacionTutor"
                      aria-describedby="crear-autorizacion-tutor-error"
                      aria-invalid={errores.autorizacionTutor ? 'true' : 'false'}
                    />
                    <span>
                      Mi padre, madre o tutor legal me autoriza a crear una cuenta
                      en Blooming y acepta que se gestionen mis datos personales.
                    </span>
                  </label>
                  <p className="cuenta-error" id="crear-autorizacion-tutor-error">
                    {errores.autorizacionTutor}
                  </p>
                </div>
                <div className="cuenta-campo">
                  <label className="cuenta-casilla">
                    <input type="checkbox"
                      id="crear-autorizacion"
                      name="autorizacion"
                      aria-describedby="crear-autorizacion-error"
                      aria-invalid={errores.autorizacion ? 'true' : 'false'}
                    />
                    <span>Autorizo a Blooming a tratar mis datos personales para gestionar mi cuenta, mis pedidos y mis puntos.</span>
                  </label>
                  <p className="cuenta-error" id="crear-autorizacion-error">{errores.autorizacion}</p>
                </div>
                <p className="cuenta-estado" role="alert">{estado}</p>
                <button type="submit" className="cuenta-enviar" disabled={enviando}>Crear cuenta</button>
              </form>
            )}
          </div>
        ) : (
          <div className="cuenta-vista" data-vista="perfil">
            <p className="cuenta-saludo">Hola, {cuenta.nombre.split(' ')[0]}</p>
            <p className="cuenta-puntos"><strong className="cuenta-puntos-saldo">{cuenta.puntos}</strong> puntos</p>
            <p className="cuenta-puntos-valor">
              Equivalen a {formatoPrecio(cuenta.puntos * VALOR_PUNTO)} de descuento.
            </p>
            <button type="button" className="cuenta-enviar" onClick={onIrMiCuenta}>
              Ir a Mi cuenta
            </button>
            <button type="button" className="cuenta-enviar cuenta-salir" onClick={salir}>Cerrar sesión</button>
          </div>
        )}
      </div>
    </dialog>
  );
}

export default DialogoCuenta;