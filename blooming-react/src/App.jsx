
import { useEffect, useState } from 'react';
import { Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import ScrollAAncla from './components/ScrollAAncla';
import CarritoPanel from './components/CarritoPanel';
import DialogoCuenta from './components/DialogoCuenta';
import Inicio from './pages/Inicio';
import Menu from './pages/Menu';
import Libros from './pages/Libros';
import Eventos from './pages/Eventos';
import MiCuenta from './pages/MiCuenta';
import Admin from './pages/Admin';
import AdminLogin from './pages/AdminLogin';
import { useTienda } from './hooks/useTienda';
import { API } from './services/api';
import RestablecerContrasena from './pages/RestablecerContrasena';

function App() {
  const { pathname } = useLocation();

  return pathname.startsWith('/admin') ? <AdminApp /> : <TiendaApp />;
}

function AdminApp() {
  return (
    <Routes>
      <Route path="/admin" element={<AdminLogin />} />
      <Route path="/admin/dashboard" element={<AdminProtegido />} />
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
}

function AdminProtegido() {
  const [estado, setEstado] = useState('verificando');

  useEffect(() => {
    let activo = true;

    API.cuentaActual()
      .then((cuenta) => {
        if (!activo) return;

        if (cuenta?.rol === 'admin') {
          setEstado('admin');
        } else if (cuenta) {
          setEstado('cliente');
        } else {
          setEstado('sin-sesion');
        }
      })
      .catch(() => {
        if (activo) setEstado('sin-sesion');
      });

    return () => {
      activo = false;
    };
  }, []);

  if (estado === 'verificando') {
    return <p>Verificando acceso administrativo...</p>;
  }

  if (estado === 'admin') {
    return <Admin />;
  }

  return (
    <Navigate
      to={estado === 'cliente' ? '/' : '/admin'}
      replace
    />
  );
}

function TiendaApp() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const paginaActiva = pathname === '/' ? 'inicio' : pathname.slice(1);

  const tienda = useTienda();
  const [carritoAbierto, setCarritoAbierto] = useState(false);
  const [cuentaAbierta, setCuentaAbierta] = useState(false);
  const [avisoCuenta, setAvisoCuenta] = useState('');

  const abrirCuenta = ({ aviso = '' } = {}) => {
    setAvisoCuenta(aviso);
    setCuentaAbierta(true);
  };

  const cerrarCuenta = () => {
    setCuentaAbierta(false);
  };

  const irAMiCuenta = () => {
    cerrarCuenta();
    navigate('/mi-cuenta');
  };

  const eliminarCuenta = async (contrasena) => {
    await tienda.eliminarCuenta(contrasena);
    navigate('/', { replace: true });
  };

  const agregarYMostrar = (producto) => {
    tienda.agregar(producto);
    setCarritoAbierto(true);
  };

  return (
    <>
      <ScrollAAncla />
      <Header
        paginaActiva={paginaActiva}
        cuenta={tienda.cuenta}
        cantidadCarrito={tienda.unidades}
        carritoAbierto={carritoAbierto}
        onAbrirCarrito={() => setCarritoAbierto((a) => !a)}
        onAbrirCuenta={() => abrirCuenta()}
      />
      <main>
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/libros" element={<Libros onAgregar={agregarYMostrar} />} />
          <Route path="/eventos" element={<Eventos onAgregar={agregarYMostrar} />} />
          <Route path="/mi-cuenta" element={tienda.cuenta ? <MiCuenta cuenta={tienda.cuenta} tienda={tienda} onEliminarCuenta={eliminarCuenta} /> : <Navigate to="/" replace />} />
          <Route path="/restablecer-contrasena" element={<RestablecerContrasena />}/>
        </Routes>
      </main>
      <Footer />
      <CarritoPanel
        abierto={carritoAbierto}
        onCerrar={() => setCarritoAbierto(false)}
        tienda={tienda}
        onPedirCuenta={abrirCuenta}
      />
      <DialogoCuenta
        abierto={cuentaAbierta}
        aviso={avisoCuenta}
        onCerrar={cerrarCuenta}
        tienda={tienda}
        onIrMiCuenta={irAMiCuenta}
      />
    </>
  );
}

export default App;
