import { useEffect, useState } from 'react';
import { API } from '../services/api';
import {
  obtenerMenu,
  guardarMenu,
} from '../services/catalogoMenu';
import {
  obtenerLibros,
  guardarLibros,
} from '../services/catalogoLibros';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  obtenerEventos,
  guardarEventos,
} from '../services/catalogoEventos';
import {
  obtenerMensajes,
  actualizarEstadoMensaje,
  eliminarMensaje,
  EVENTO_CONTACTOS,
} from '../services/catalogoContactos';

const formatoCOP = (valor) =>
  `$${(Number(valor) || 0).toLocaleString('es-CO')}`;

const abreviarCOP = (valor) => {
  const n = Number(valor) || 0;

  if (n >= 1000000) {
    return `$${(n / 1000000).toLocaleString('es-CO', {
      maximumFractionDigits: 1,
    })} M`;
  }

  if (n >= 1000) return `$${Math.round(n / 1000)} mil`;

  return `$${n}`;
};

const generarId = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

const TITULOS_SECCION = {
  dashboard: 'Dashboard',
  libros: 'Libros',
  menu: 'Menú',
  eventos: 'Eventos',
  pedidos: 'Pedidos',
  clientes: 'Clientes',
  contacto: 'Contacto',
  insights: 'Blooming Insights',
};

const IDEAS_ASISTENTE = [
  '¿Cómo van las ventas este mes?',
  '¿Qué productos debería promocionar?',
  '¿Qué clientes podría reactivar?',
];

const nombreDeCliente = (cliente) =>
  typeof cliente === 'object' && cliente !== null
    ? cliente.nombre || 'Cliente'
    : cliente || 'Cliente';

const FORMULARIO_MENU_VACIO = {
  nombre: '',
  detalle: '',
  descripcion: '',
  cita: '',
  precio: '',
  etiquetas: '',
};

const FORMULARIO_LIBRO_VACIO = {
  titulo: '',
  autor: '',
  editorial: '',
  precio: '',
  paginas: '',
  imagen: '',
  sinopsis: '',
  club: false,
  cajaNombre: '',
  cajaConcepto: '',
  stockLibro: '30',
  stockCajita: '30',
};

const FORMULARIO_EVENTO_VACIO = {
  titulo: '',
  fecha: '',
  tipo: 'evento',
  categoria: '',
  hora: '',
  duracion: '2 horas',
  lugar: 'Blooming',
  imagen: '',
  dirige: '',
  lectura: '',
  precio: '',
  cupos: '',
  descripcion: '',
  incluye: '',
  libroId: '',
};

export default function Admin() {
  const [seccion, setSeccion] = useState('dashboard');
  const [resumen, setResumen] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [pedidos, setPedidos] = useState([]);
  const [cargandoPedidos, setCargandoPedidos] = useState(false);
  const [errorPedidos, setErrorPedidos] = useState('');
  const [busquedaPedido, setBusquedaPedido] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [clientes, setClientes] = useState([]);
  const [busquedaCliente, setBusquedaCliente] = useState('');
  const [menuAdmin, setMenuAdmin] = useState(obtenerMenu);
  const [tipoElemento, setTipoElemento] = useState('producto');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(
    'bebidas-calientes'
  );
  const [elementoEditando, setElementoEditando] = useState(null);
  const [formularioMenu, setFormularioMenu] = useState(FORMULARIO_MENU_VACIO);
  const [libros, setLibros] = useState(obtenerLibros);
  const [busquedaLibro, setBusquedaLibro] = useState('');
  const [libroEditando, setLibroEditando] = useState(null);
  const [formularioLibro, setFormularioLibro] = useState(FORMULARIO_LIBRO_VACIO);
  const [eventosAdmin, setEventosAdmin] = useState(obtenerEventos);
  const [eventoEditando, setEventoEditando] = useState(null);
  const [formularioEvento, setFormularioEvento] = useState(
    FORMULARIO_EVENTO_VACIO
  );
  const [mensajesContacto, setMensajesContacto] = useState(obtenerMensajes);
  const [periodoProductos, setPeriodoProductos] = useState('anio');
  const [periodoIngresos, setPeriodoIngresos] = useState('7');
  const [preguntaIA, setPreguntaIA] = useState('');
  const [respuestaIA, setRespuestaIA] = useState('');
  const [cargandoIA, setCargandoIA] = useState(false);
  const [errorIA, setErrorIA] = useState('');

  async function consultarIA(e) {
    e.preventDefault();

    if (!preguntaIA.trim() || cargandoIA) return;

    setCargandoIA(true);
    setErrorIA('');
    setRespuestaIA('');

    try {
      const resultado = await API.consultarIAAdmin(preguntaIA.trim());
      setRespuestaIA(resultado.respuesta || 'No se recibió una respuesta.');
    } catch (error) {
      setErrorIA(error.message || 'No fue posible consultar a Gemini.');
    } finally {
      setCargandoIA(false);
    }
  }

  useEffect(() => {
    let activo = true;

    API.obtenerMenu()
      .then((menuServidor) => {
        const tieneDatos =
          menuServidor.combos.length > 0 ||
          menuServidor.categorias.length > 0 ||
          menuServidor.especiales.length > 0;

        if (activo && tieneDatos) {
          guardarMenu(menuServidor);
          setMenuAdmin(menuServidor);
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
    let activo = true;

    API.obtenerLibros()
      .then((librosServidor) => {
        if (activo && librosServidor.length > 0) {
          guardarLibros(librosServidor);
          setLibros(librosServidor);
        }
      })
      .catch((error) => {
        console.error('Error al cargar los libros:', error.message);
      });

    return () => {
      activo = false;
    };
  }, []);

  useEffect(() => {
    let activo = true;

    API.obtenerEventos()
      .then((eventosServidor) => {
        if (activo && eventosServidor.length > 0) {
          guardarEventos(eventosServidor);
          setEventosAdmin(eventosServidor);
        }
      })
      .catch((error) => {
        console.error('Error al cargar los eventos:', error.message);
      });

    return () => {
      activo = false;
    };
  }, []);

  useEffect(() => {
    const actualizarMensajes = () => {
      setMensajesContacto(obtenerMensajes());
    };

    window.addEventListener(EVENTO_CONTACTOS, actualizarMensajes);

    return () => {
      window.removeEventListener(EVENTO_CONTACTOS, actualizarMensajes);
    };
  }, []);

  // Dashboard e Insights usan el mismo resumen
  useEffect(() => {
    if (seccion !== 'dashboard' && seccion !== 'insights') return;

    let activo = true;

    API.resumenAdmin()
      .then((datos) => {
        if (activo) {
          setResumen(datos);
          setError('');
        }
      })
      .catch(() => {
        if (activo) {
          setError('No fue posible cargar los datos administrativos.');
        }
      })
      .finally(() => {
        if (activo) setCargando(false);
      });

    return () => {
      activo = false;
    };
  }, [seccion]);

  useEffect(() => {
    if (seccion !== 'pedidos') return;

    let activo = true;

    API.pedidosAdmin()
      .then((datos) => {
        if (activo) {
          setPedidos(datos);
          setErrorPedidos('');
        }
      })
      .catch(() => {
        if (activo) {
          setErrorPedidos('No fue posible cargar los pedidos.');
        }
      })
      .finally(() => {
        if (activo) setCargandoPedidos(false);
      });

    return () => {
      activo = false;
    };
  }, [seccion]);

  useEffect(() => {
    if (seccion !== 'clientes' && seccion !== 'insights') return;

    let vigente = true;

    API.clientesAdmin()
      .then((datos) => {
        if (vigente) setClientes(datos);
      })
      .catch(() => {
        if (vigente) setClientes([]);
      });

    return () => {
      vigente = false;
    };
  }, [seccion]);

  const rechazarPedido = async (pedido) => {
    if (!pedido?._id || pedido.estado !== 'PENDIENTE') return;

    if (!window.confirm(`¿Rechazar el pedido ${pedido.referencia || ''}?`)) {
      return;
    }

    try {
      const actualizado = await API.rechazarPedido(pedido._id);

      setPedidos((actuales) =>
        actuales.map((item) =>
          item._id === actualizado._id
            ? {
                ...item,
                ...actualizado,
                fecha: actualizado.createdAt || actualizado.fecha,
                totalPagado: actualizado.total,
              }
            : item
        )
      );
    } catch (error) {
      setErrorPedidos(
        error.message || 'No fue posible rechazar el pedido.'
      );
    }
  };

  const pedidosFiltrados = pedidos.filter((pedido) => {
    const texto = busquedaPedido.trim().toLowerCase();

    const coincideBusqueda = !texto || [
      pedido.referencia,
      pedido.cliente?.nombre,
      pedido.cliente?.correo,
    ].some((valor) =>
      String(valor || '').toLowerCase().includes(texto)
    );

    const coincideEstado =
      filtroEstado === 'todos' || pedido.estado === filtroEstado;

    return coincideBusqueda && coincideEstado;
  });

  const clientesFiltrados = clientes.filter((cliente) => {
    const texto = busquedaCliente.trim().toLowerCase();

    return [
      cliente.nombre,
      cliente.correo,
      cliente.whatsapp,
      cliente.idCliente,
    ].some((valor) =>
      String(valor || '').toLowerCase().includes(texto)
    );
  });

  /* ---------- MENÚ ---------- */

  const actualizarFormularioMenu = (campo, valor) => {
    setFormularioMenu((anterior) => ({
      ...anterior,
      [campo]: valor,
    }));
  };

  const cancelarEdicionMenu = () => {
    setElementoEditando(null);
    setFormularioMenu(FORMULARIO_MENU_VACIO);
  };

  const guardarElementoMenu = async (e) => {
    e.preventDefault();

    const precio = Number(formularioMenu.precio);
    const nombre = formularioMenu.nombre.trim();

    if (!nombre || !(precio > 0)) return;

    let actualizado = { ...menuAdmin };

    if (tipoElemento === 'combo') {
      const elemento = {
        id: elementoEditando?.id || `combo-${generarId()}`,
        nombre,
        detalle: formularioMenu.detalle.trim(),
        precio,
      };

      actualizado.combos = elementoEditando
        ? menuAdmin.combos.map((item) =>
            item.id === elementoEditando.id ? elemento : item
          )
        : [...menuAdmin.combos, elemento];
    } else if (tipoElemento === 'especial') {
      const elemento = {
        id: elementoEditando?.id || `especial-${generarId()}`,
        nombre,
        cita: formularioMenu.cita.trim(),
        descripcion: formularioMenu.descripcion.trim(),
        precio,
        etiquetas: formularioMenu.etiquetas.trim(),
      };

      actualizado.especiales = elementoEditando
        ? menuAdmin.especiales.map((item) =>
            item.id === elementoEditando.id ? elemento : item
          )
        : [...menuAdmin.especiales, elemento];
    } else {
      const categoriaActual = menuAdmin.categorias.find(
        (categoria) => categoria.id === categoriaSeleccionada
      );

      if (!categoriaActual) return;

      // Los productos se identifican por nombre: no se permiten repetidos
      const nombreRepetido = categoriaActual.items.some(
        (item) =>
          item.nombre.toLowerCase() === nombre.toLowerCase() &&
          item.nombre !== elementoEditando?.nombre
      );

      if (nombreRepetido) {
        window.alert('Ya existe un producto con ese nombre en esta categoría.');
        return;
      }

      const elemento = {
        nombre,
        precio,
        descripcion: formularioMenu.descripcion.trim(),
        etiquetas: formularioMenu.etiquetas.trim(),
      };

      actualizado.categorias = menuAdmin.categorias.map((categoria) =>
        categoria.id === categoriaSeleccionada
          ? {
              ...categoria,
              items: elementoEditando
                ? categoria.items.map((item) =>
                    item.nombre === elementoEditando.nombre ? elemento : item
                  )
                : [...categoria.items, elemento],
            }
          : categoria
      );
    }

    try {
      const menuGuardado = await API.guardarMenu(actualizado);

      guardarMenu(menuGuardado);
      setMenuAdmin(menuGuardado);
      cancelarEdicionMenu();
    } catch (error) {
      window.alert(error.message || 'No fue posible guardar el menú.');
    }
  };

  const editarElementoMenu = (elemento, tipo, categoriaId = '') => {
    setTipoElemento(tipo);

    // Solo los productos pertenecen a una categoría
    if (tipo === 'producto' && categoriaId) {
      setCategoriaSeleccionada(categoriaId);
    }

    setElementoEditando(elemento);
    setFormularioMenu({
      nombre: elemento.nombre || '',
      detalle: elemento.detalle || '',
      descripcion: elemento.descripcion || '',
      cita: elemento.cita || '',
      precio: String(elemento.precio || ''),
      etiquetas: elemento.etiquetas || '',
    });
  };

  const eliminarElementoMenu = async (elemento, tipo, categoriaId = '') => {
    if (!window.confirm('¿Deseas eliminar este elemento del menú?')) return;

    let actualizado = { ...menuAdmin };

    if (tipo === 'combo') {
      actualizado.combos = menuAdmin.combos.filter(
        (item) => item.id !== elemento.id
      );
    } else if (tipo === 'especial') {
      actualizado.especiales = menuAdmin.especiales.filter(
        (item) => item.id !== elemento.id
      );
    } else {
      actualizado.categorias = menuAdmin.categorias.map((categoria) =>
        categoria.id === categoriaId
          ? {
              ...categoria,
              items: categoria.items.filter(
                (item) => item.nombre !== elemento.nombre
              ),
            }
          : categoria
      );
    }

    try {
      const menuGuardado = await API.guardarMenu(actualizado);

      guardarMenu(menuGuardado);
      setMenuAdmin(menuGuardado);
    } catch (error) {
      window.alert(error.message || 'No fue posible actualizar el menú.');
    }

    // Si se eliminó lo que se estaba editando, se limpia el formulario
    if (
      elementoEditando &&
      (tipo === 'producto'
        ? elementoEditando.nombre === elemento.nombre &&
          categoriaId === categoriaSeleccionada
        : elementoEditando.id === elemento.id)
    ) {
      cancelarEdicionMenu();
    }
  };

  /* ---------- LIBROS ---------- */

  const librosFiltrados = libros.filter((libro) =>
    `${libro.titulo} ${libro.autor} ${libro.editorial}`
      .toLowerCase()
      .includes(busquedaLibro.trim().toLowerCase())
  );

  const actualizarFormularioLibro = (campo, valor) => {
    setFormularioLibro((anterior) => ({
      ...anterior,
      [campo]: valor,
    }));
  };

  const cancelarEdicionLibro = () => {
    setLibroEditando(null);
    setFormularioLibro(FORMULARIO_LIBRO_VACIO);
  };

  const guardarLibroAdmin = async (e) => {
    e.preventDefault();

    const nuevoLibro = {
      ...formularioLibro,
      id: libroEditando?.id || `libro-${generarId()}`,
      titulo: formularioLibro.titulo.trim(),
      autor: formularioLibro.autor.trim(),
      editorial: formularioLibro.editorial.trim(),
      imagen: formularioLibro.imagen.trim(),
      precio: Number(formularioLibro.precio),
      paginas: Number(formularioLibro.paginas),
      stockLibro: Math.max(0, Number(formularioLibro.stockLibro)),
      stockCajita: Math.max(0, Number(formularioLibro.stockCajita)),
      sinopsis: formularioLibro.sinopsis
        .split('\n')
        .map((texto) => texto.trim())
        .filter(Boolean),
      club: Boolean(formularioLibro.club),
      cajaNombre: formularioLibro.cajaNombre.trim(),
      cajaConcepto: formularioLibro.cajaConcepto.trim(),
    };

    if (!nuevoLibro.titulo || !(nuevoLibro.precio > 0)) return;

    try {
      const libroGuardado = libroEditando
        ? await API.actualizarLibro(nuevoLibro.id, nuevoLibro)
        : await API.guardarLibro(nuevoLibro);

      const listaActualizada = libroEditando
        ? libros.map((libro) =>
            libro.id === libroGuardado.id ? libroGuardado : libro
          )
        : [...libros, libroGuardado];

      guardarLibros(listaActualizada);
      setLibros(listaActualizada);
      cancelarEdicionLibro();
    } catch (error) {
      window.alert(error.message || 'No fue posible guardar el libro.');
    }
  };

  const editarLibroAdmin = (libro) => {
    setLibroEditando(libro);
    setFormularioLibro({
      titulo: libro.titulo || '',
      autor: libro.autor || '',
      editorial: libro.editorial || '',
      precio: String(libro.precio || ''),
      paginas: String(libro.paginas || ''),
      imagen: libro.imagen || '',
      sinopsis: (libro.sinopsis || []).join('\n'),
      club: Boolean(libro.club),
      cajaNombre: libro.cajaNombre || '',
      cajaConcepto: libro.cajaConcepto || '',
      stockLibro: String(libro.stockLibro ?? 30),
      stockCajita: String(libro.stockCajita ?? 30),
    });
  };

  const eliminarLibroAdmin = async (id) => {
    const eventosConLibro = eventosAdmin.filter(
      (evento) => evento.libroId === id
    );

    const mensajeConfirmacion = eventosConLibro.length > 0
      ? `Este libro está asignado a ${eventosConLibro.length} club(es) de lectura. Se quitará de ellos. ¿Deseas eliminarlo del catálogo?`
      : '¿Deseas eliminar este libro del catálogo?';

        if (!window.confirm(mensajeConfirmacion)) return;

    try {
      await API.actualizarLibro(id, { activo: false });

      const actualizado = libros.filter((libro) => libro.id !== id);

      guardarLibros(actualizado);
      setLibros(actualizado);
    } catch (error) {
      window.alert(error.message || 'No fue posible eliminar el libro.');
      return;
    }

    if (eventosConLibro.length > 0) {
      const eventosActualizados = eventosAdmin.map((evento) =>
        evento.libroId === id ? { ...evento, libroId: '' } : evento
      );

      guardarEventos(eventosActualizados);
      setEventosAdmin(eventosActualizados);
    }

    if (libroEditando?.id === id) {
      cancelarEdicionLibro();
    }
  };

  /* ---------- EVENTOS ---------- */

  const actualizarFormularioEvento = (campo, valor) => {
    setFormularioEvento((anterior) => ({
      ...anterior,
      [campo]: valor,
    }));
  };

  const cancelarEdicionEvento = () => {
    setEventoEditando(null);
    setFormularioEvento(FORMULARIO_EVENTO_VACIO);
  };

  const guardarEventoAdmin = async (e) => {
    e.preventDefault();

    if (!formularioEvento.titulo.trim() || !formularioEvento.fecha) return;

    const nuevoEvento = {
      ...eventoEditando,
      id: eventoEditando?.id || `evento-${generarId()}`,
      titulo: formularioEvento.titulo.trim(),
      fecha: formularioEvento.fecha,
      tipo: formularioEvento.tipo,
      categoria: formularioEvento.categoria.trim(),
      hora: formularioEvento.hora,
      duracion: formularioEvento.duracion.trim(),
      lugar: formularioEvento.lugar.trim(),
      imagen: formularioEvento.imagen.trim(),
      dirige: formularioEvento.dirige.trim(),
      lectura: formularioEvento.lectura.trim(),
      precio: Number(formularioEvento.precio) || 0,
      cupos: Number(formularioEvento.cupos) || 0,
      descripcion: formularioEvento.descripcion
        .split('\n')
        .map((texto) => texto.trim())
        .filter(Boolean),
      incluye: formularioEvento.incluye
        .split('\n')
        .map((texto) => texto.trim())
        .filter(Boolean),
    };

    if (nuevoEvento.tipo === 'club') {
      nuevoEvento.libroId = formularioEvento.libroId || '';

      nuevoEvento.reuniones = eventoEditando?.reuniones || [
        {
          tipo: 'presencial',
          fecha: nuevoEvento.fecha,
          hora: nuevoEvento.hora,
          duracion: nuevoEvento.duracion,
        },
      ];
    } else {
      delete nuevoEvento.libroId;
      delete nuevoEvento.reuniones;
    }

    try {
      const eventoGuardado = eventoEditando
        ? await API.actualizarEvento(nuevoEvento.id, nuevoEvento)
        : await API.guardarEvento(nuevoEvento);

      const listaActualizada = eventoEditando
        ? eventosAdmin.map((evento) =>
            evento.id === eventoGuardado.id ? eventoGuardado : evento
          )
        : [...eventosAdmin, eventoGuardado];

      guardarEventos(listaActualizada);
      setEventosAdmin(listaActualizada);
      cancelarEdicionEvento();
    } catch (error) {
      window.alert(error.message || 'No fue posible guardar el evento.');
    }
  };

  const editarEventoAdmin = (evento) => {
    setEventoEditando(evento);
    setFormularioEvento({
      titulo: evento.titulo || '',
      fecha: evento.fecha || '',
      tipo: evento.tipo || 'evento',
      categoria: evento.categoria || '',
      hora: evento.hora || '',
      duracion: evento.duracion || '2 horas',
      lugar: evento.lugar || 'Blooming',
      imagen: evento.imagen || '',
      dirige: evento.dirige || '',
      lectura: evento.lectura || '',
      precio: String(evento.precio ?? ''),
      cupos: String(evento.cupos ?? ''),
      descripcion: (evento.descripcion || []).join('\n'),
      incluye: (evento.incluye || []).join('\n'),
      libroId: evento.libroId || '',
    });
  };

  const eliminarEventoAdmin = async (id) => {
    if (!window.confirm('¿Deseas eliminar este evento?')) return;

    try {
      await API.actualizarEvento(id, { activo: false });

      const actualizado = eventosAdmin.filter((evento) => evento.id !== id);

      guardarEventos(actualizado);
      setEventosAdmin(actualizado);
    } catch (error) {
      window.alert(error.message || 'No fue posible eliminar el evento.');
      return;
    }

    if (eventoEditando?.id === id) {
      cancelarEdicionEvento();
    }
  };

  const eventosOrdenados = [...eventosAdmin].sort((a, b) =>
    String(a.fecha || '').localeCompare(String(b.fecha || ''))
  );

  /* ---------- INSIGHTS ---------- */

  const datosProductosPorPeriodo = {
    7: resumen?.ventasProductos7Dias || {
      productos: [],
      datos: [],
    },
    mes: resumen?.ventasProductosMes || {
      productos: [],
      datos: [],
    },
    anio: resumen?.ventasProductosAnio || {
      productos: [],
      datos: [],
    },
  };

  const productosPeriodo = datosProductosPorPeriodo[periodoProductos];

  const productosInsights = productosPeriodo.productos;
  const ingresosInsights =
  periodoIngresos === '7'
    ? resumen?.ingresosSemanales || []
    : periodoIngresos === 'mes'
      ? resumen?.ingresosMensuales || []
      : resumen?.ingresosAnuales || [];
  const ventasInsights = resumen?.ventasPorDia || [];

  const productoDestacado = (
    resumen?.productosMasVendidos || []
  ).reduce(
    (mejor, producto) =>
      !mejor || producto.cantidad > mejor.cantidad
        ? producto
        : mejor,
    null
  );

  const clientesConCompras = clientes.filter(
    (cliente) => (Number(cliente.pedidosAprobados) || 0) > 0
  );

  const clientesSinCompras = clientes.filter(
    (cliente) => !((Number(cliente.pedidosAprobados) || 0) > 0)
  );

  const clientesConPuntos = clientes.filter(
    (cliente) => Number(cliente.puntos) > 0
  );

  const totalPuntosDisponibles = clientes.reduce(
    (total, cliente) => total + (Number(cliente.puntos) || 0),
    0
  );

    const diaDestacado = ventasInsights.reduce(
    (mejor, dia) =>
      dia.total > 0 && (!mejor || dia.total > mejor.total)
        ? dia
        : mejor,
    null
  );

  const recomendaciones = [
    productoDestacado
      ? `Considera destacar ${productoDestacado.nombre} en las promociones y comunicaciones de Blooming, dado su rendimiento en ventas.`
      : 'Registra tus primeras ventas para comenzar a generar recomendaciones comerciales.',
    ...(resumen?.clientes === 0
      ? [
          'Todavía no hay clientes registrados. Promueve la creación de cuentas y el programa de puntos.',
        ]
      : []),
  ];

  return (
    <div className="admin">
      <aside className="admin-sidebar">
        <div className="admin-logo">Blooming</div>
        <p className="admin-subtitulo">Administración</p>

        <nav className="admin-nav">
          {Object.entries(TITULOS_SECCION).map(([clave, titulo]) => (
            <button
              key={clave}
              type="button"
              className={seccion === clave ? 'activo' : ''}
              onClick={() => setSeccion(clave)}
            >
              {titulo}
            </button>
          ))}
        </nav>

        <button
          type="button"
          className="admin-cerrar"
          onClick={() => {
            window.location.href = '/';
          }}
        >
          Volver a la tienda
        </button>
      </aside>

      <main className="admin-main">
        <header className="admin-header">
          <div>
            <p>Blooming · Administración</p>
            <h1>{TITULOS_SECCION[seccion]}</h1>
          </div>

          <span>Administrador principal</span>
        </header>

        {seccion === 'dashboard' && (
          <section className="admin-dashboard">
            <div className="admin-bienvenida">
              <h2>Bienvenido a Blooming</h2>
              <p>Este es el resumen general de tu librería café.</p>
            </div>

            {cargando && <p>Cargando indicadores...</p>}

            {error && <p role="alert">{error}</p>}

            {resumen && (
              <>
                <div className="admin-indicadores">
                  <article>
                    <span>Ingresos</span>
                    <strong>{formatoCOP(resumen.ingresos)}</strong>
                    <small>Acumulado</small>
                  </article>

                  <article>
                    <span>Pedidos</span>
                    <strong>{resumen.pedidos}</strong>
                    <small>{resumen.pedidosMes} este mes</small>
                  </article>

                  <article>
                    <span>Clientes</span>
                    <strong>{resumen.clientes}</strong>
                    <small>Registrados</small>
                  </article>

                  <article>
                    <span>Puntos redimidos</span>
                    <strong>
                      {(Number(resumen.puntosRedimidos) || 0).toLocaleString('es-CO')}
                    </strong>
                    <small>Acumulados</small>
                  </article>

                </div>

                <div className="admin-panel-grafica">
                  <h2>Distribución de clientes por edad</h2>
                  <div style={{ width: '100%', height: 280 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={(resumen.distribucionEdad || []).map(item => ({
                          ...item,
                          porcentaje: resumen.distribucionEdad.reduce((total, dato) => total + dato.cantidad, 0)
                            ? Number((item.cantidad / resumen.distribucionEdad.reduce((total, dato) => total + dato.cantidad, 0) * 100).toFixed(1))
                            : 0
                        }))}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="rango" tick={{ fontSize: 11 }} />
                        <YAxis unit="%" domain={[0, 100]} />
                        <Tooltip formatter={(valor, nombre, props) => [
                          nombre === 'Porcentaje' ? `${valor}% (${props.payload.cantidad} clientes)` : valor,
                          nombre
                        ]} />
                        <Bar dataKey="porcentaje" name="Porcentaje" fill="#8B8B30" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="admin-panel-grafica">
                  <h2>Distribución de clientes por género</h2>
                  <div style={{ width: '100%', height: 280 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={(resumen.distribucionGenero || []).filter(item => item.cantidad > 0).map(item => ({
                            ...item,
                            porcentaje: Number((item.cantidad / resumen.distribucionGenero.reduce((total, dato) => total + dato.cantidad, 0) * 100).toFixed(1))
                          }))}
                          dataKey="cantidad"
                          nameKey="genero"
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={95}
                          label={({ porcentaje }) => `${porcentaje}%`}
                        >
                          {['#B58A9C', '#8B8B30', '#D6B36A', '#849B9A'].map((color, index) => (
                            <Cell key={index} fill={color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(valor, nombre, props) => [
                          `${valor} clientes (${props.payload.porcentaje}%)`,
                          nombre
                        ]} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="admin-panel-grafica">
                  <div className="admin-grafica-encabezado">
                    <h2>Ingresos de Blooming</h2>

                    <select
                      value={periodoIngresos}
                      onChange={(e) => setPeriodoIngresos(e.target.value)}
                      aria-label="Filtrar ingresos por periodo"
                    >
                      <option value="7">Últimos 7 días</option>
                      <option value="mes">Últimos 12 meses</option>
                      <option value="anio">Año actual</option>
                    </select>
                  </div>

                  <div style={{ width: '100%', height: 280 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={ingresosInsights}
                        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(70, 32, 20, 0.12)" />

                        <XAxis
                          dataKey="periodo"
                          tick={{ fill: '#462014', fontSize: 11 }}
                          axisLine={false}
                          tickLine={false}
                        />

                        <YAxis
                          tickFormatter={abreviarCOP}
                          tick={{ fill: '#462014', fontSize: 11 }}
                          axisLine={false}
                          tickLine={false}
                          width={56}
                        />

                        <Tooltip
                          cursor={{ fill: 'rgba(70, 32, 20, 0.06)' }}
                          formatter={(valor) => [formatoCOP(valor), 'Ingresos']}
                          contentStyle={{
                            borderRadius: '10px',
                            border: 'none',
                            background: '#F4F4DA',
                            boxShadow: '0 4px 14px rgba(70, 32, 20, 0.25)',
                          }}
                        />

                        <Bar
                          dataKey="ingresos"
                          name="Ingresos"
                          fill="#8B8B30"
                          radius={[6, 6, 0, 0]}
                          maxBarSize={55}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="admin-panel-grafica">
                  <div className="admin-grafica-encabezado">
                    <h2>Productos más vendidos</h2>

                    <select
                      value={periodoProductos}
                      onChange={(e) => setPeriodoProductos(e.target.value)}
                      aria-label="Filtrar productos más vendidos por periodo"
                    >
                      <option value="7">Últimos 7 días</option>
                      <option value="mes">Este mes</option>
                      <option value="anio">Este año</option>
                    </select>
                  </div>

                  {productosInsights.length > 0 ? (
                    <div style={{ width: '100%', height: 320 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={productosInsights}
                          margin={{ top: 15, right: 20, left: 5, bottom: 45 }}
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="rgba(70, 32, 20, 0.12)"
                          />

                          <XAxis
                            dataKey="nombre"
                            angle={-25}
                            textAnchor="end"
                            interval={0}
                            height={65}
                            tick={{ fill: '#462014', fontSize: 11 }}
                            axisLine={false}
                            tickLine={false}
                          />

                          <YAxis
                            allowDecimals={false}
                            tick={{ fill: '#462014', fontSize: 11 }}
                            axisLine={false}
                            tickLine={false}
                            width={40}
                          />

                          <Tooltip
                            formatter={(valor) => [`${valor} unidades`, 'Vendidas']}
                            contentStyle={{
                              borderRadius: '10px',
                              border: 'none',
                              background: '#F4F4DA',
                              boxShadow: '0 4px 14px rgba(70, 32, 20, 0.25)',
                            }}
                          />

                          <Bar
                            dataKey="cantidad"
                            name="Unidades vendidas"
                            fill="#8B8B30"
                            radius={[6, 6, 0, 0]}
                            maxBarSize={55}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <p>No hay productos vendidos en este periodo.</p>
                  )}
                </div>

                <div className="admin-panel-grafica">
                  <h2>Pedidos recientes</h2>

                  {!resumen.pedidosRecientes ||
                  resumen.pedidosRecientes.length === 0 ? (
                    <p>Aún no hay pedidos registrados.</p>
                  ) : (
                    <div style={{ overflowX: 'auto' }}>
                      <table>
                        <thead>
                          <tr>
                            <th>Referencia</th>
                            <th>Cliente</th>
                            <th>Fecha</th>
                            <th>Total</th>
                            <th>Estado</th>
                          </tr>
                        </thead>

                        <tbody>
                          {resumen.pedidosRecientes.map((pedido, indice) => (
                            <tr key={`${pedido.referencia}-${indice}`}>
                              <td>{pedido.referencia}</td>
                              <td>{nombreDeCliente(pedido.cliente)}</td>
                              <td>
                                {pedido.fecha
                                  ? new Date(pedido.fecha).toLocaleDateString('es-CO')
                                  : '—'}
                              </td>
                              <td>{formatoCOP(pedido.totalPagado)}</td>
                              <td>{pedido.estado}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </>
            )}
          </section>
        )}

        {seccion === 'pedidos' && (
          <section className="admin-contenido">
            <h2>Gestión de pedidos</h2>
            <p>Consulta y filtra los pedidos de Blooming.</p>

            {errorPedidos && <p role="alert">{errorPedidos}</p>}

            <div className="admin-filtros">
              <input
                type="search"
                placeholder="Buscar por referencia o cliente..."
                aria-label="Buscar pedidos"
                value={busquedaPedido}
                onChange={(e) => setBusquedaPedido(e.target.value)}
              />

              <select
                value={filtroEstado}
                aria-label="Filtrar pedidos por estado"
                onChange={(e) => setFiltroEstado(e.target.value)}
              >
                <option value="todos">Todos los estados</option>
                <option value="APROBADO">Aprobados</option>
                <option value="PENDIENTE">Pendientes</option>
                <option value="RECHAZADO">Rechazados</option>
                <option value="CANCELADO">Cancelados</option>
              </select>
            </div>

            <div className="admin-panel-grafica">
              <div style={{ overflowX: 'auto' }}>
                {cargandoPedidos ? (
                  <p>Cargando pedidos...</p>
                ) : pedidosFiltrados.length === 0 ? (
                  <p>No hay pedidos que coincidan con la búsqueda.</p>
                ) : (
                  <table>
                    <thead>
                      <tr>
                        <th>Referencia</th>
                        <th>Cliente</th>
                        <th>Fecha</th>
                        <th>Total</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>

                    <tbody>
                      {pedidosFiltrados.map((pedido, indice) => (
                        <tr key={pedido.id || pedido.referencia || indice}>
                          <td>{pedido.referencia || pedido.id}</td>
                          <td>{nombreDeCliente(pedido.cliente)}</td>
                          <td>
                            {pedido.fecha
                              ? new Date(pedido.fecha).toLocaleDateString('es-CO')
                              : '—'}
                          </td>
                          <td>{formatoCOP(pedido.totalPagado)}</td>
                          <td>{pedido.estado || 'Sin estado'}</td>
                          <td>
                            {pedido.estado === 'PENDIENTE' && (
                              <button
                                type="button"
                                onClick={() => rechazarPedido(pedido)}
                              >
                                Rechazar
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </section>
        )}

        {seccion === 'clientes' && (
          <section className="admin-seccion">
            <div className="admin-seccion-cabecera">
              <div>
                <h2>Clientes</h2>
                <p>Consulta la información y actividad de tus clientes.</p>
              </div>
              <span>{clientesFiltrados.length} clientes</span>
            </div>

            <div className="admin-filtros">
              <input
                type="search"
                placeholder="Buscar por nombre, correo, WhatsApp o ID..."
                aria-label="Buscar clientes"
                value={busquedaCliente}
                onChange={(e) => setBusquedaCliente(e.target.value)}
              />
            </div>

            <div className="admin-tabla-contenedor">
              <table className="admin-tabla">
                <thead>
                  <tr>
                    <th>Cliente</th>
                    <th>Correo</th>
                    <th>WhatsApp</th>
                    <th>Puntos</th>
                    <th>Pedidos</th>
                    <th>Total compras</th>
                  </tr>
                </thead>

                <tbody>
                  {clientesFiltrados.map((cliente) => (
                    <tr key={cliente.idCliente}>
                      <td>
                        <strong>{cliente.nombre}</strong>
                        <small>{cliente.idCliente}</small>
                      </td>
                      <td>{cliente.correo || '—'}</td>
                      <td>{cliente.whatsapp || '—'}</td>
                      <td>{(Number(cliente.puntos) || 0).toLocaleString('es-CO')}</td>
                      <td>{cliente.totalPedidos}</td>
                      <td>{formatoCOP(cliente.totalCompras)}</td>
                    </tr>
                  ))}

                  {clientesFiltrados.length === 0 && (
                    <tr>
                      <td colSpan="6">
                        No se encontraron clientes.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {seccion === 'insights' && (
          <section className="admin-contenido">
            <div>
              <h2>Blooming Insights</h2>
              <p>
                Análisis del rendimiento y comportamiento de Blooming.
              </p>
            </div>

            {cargando && <p>Preparando análisis...</p>}

            {error && <p role="alert">{error}</p>}

            {resumen && (
              <>
                <div className="admin-indicadores">
                  <article>
                    <span>Ingresos acumulados</span>
                    <strong>{formatoCOP(resumen.ingresos)}</strong>
                    <small>Ventas aprobadas</small>
                  </article>

                  <article>
                    <span>Clientes registrados</span>
                    <strong>{resumen.clientes}</strong>
                    <small>Base de clientes</small>
                  </article>

                  <article>
                    <span>Pedidos registrados</span>
                    <strong>{resumen.pedidos}</strong>
                    <small>Actividad comercial</small>
                  </article>

                  <article>
                    <span>Puntos redimidos</span>
                    <strong>
                      {(Number(resumen.puntosRedimidos) || 0).toLocaleString('es-CO')}
                    </strong>
                    <small>Programa de fidelización</small>
                  </article>
                </div>

                <div className="admin-insights">
                  <section className="admin-insight">
                    <span className="admin-insight-etiqueta">Producto destacado del año</span>

                    {productoDestacado ? (
                      <>
                        <strong className="admin-insight-titulo">
                          {productoDestacado.nombre}
                        </strong>

                        <dl className="admin-insight-datos">
                          <div>
                            <dt>Unidades</dt>
                            <dd>{productoDestacado.cantidad}</dd>
                          </div>
                          <div>
                            <dt>Ingresos</dt>
                            <dd>{formatoCOP(productoDestacado.ingresos)}</dd>
                          </div>
                        </dl>
                      </>
                    ) : (
                      <p className="admin-insight-vacio">
                        Aún no hay suficientes ventas para identificar un producto destacado.
                      </p>
                    )}
                  </section>

                  <section className="admin-insight">
                    <span className="admin-insight-etiqueta">
                      Mejor día de ventas · últimos 7 días
                    </span>

                    {diaDestacado ? (
                      <>
                        <strong className="admin-insight-titulo admin-insight-dia">
                          {diaDestacado.dia}
                        </strong>

                        <dl className="admin-insight-datos">
                          <div>
                            <dt>Ingresos</dt>
                            <dd>{formatoCOP(diaDestacado.total)}</dd>
                          </div>
                        </dl>
                      </>
                    ) : (
                      <p className="admin-insight-vacio">
                        Aún no hay información suficiente para identificar tendencias.
                      </p>
                    )}
                  </section>

                  <section className="admin-insight admin-insight-ancha">
                    <span className="admin-insight-etiqueta">Recomendaciones iniciales</span>

                    <ul className="admin-insight-lista">
                      {recomendaciones.map((texto) => (
                        <li key={texto}>{texto}</li>
                      ))}
                    </ul>
                  </section>
                </div>
                <div className="admin-indicadores">
                  <article>
                    <span>Clientes con compras</span>
                    <strong>{clientesConCompras.length}</strong>
                  </article>

                  <article>
                    <span>Clientes sin compras</span>
                    <strong>{clientesSinCompras.length}</strong>
                  </article>

                  <article>
                    <span>Clientes con puntos</span>
                    <strong>{clientesConPuntos.length}</strong>
                  </article>

                  <article>
                    <span>Puntos disponibles</span>
                    <strong>{totalPuntosDisponibles.toLocaleString('es-CO')}</strong>
                  </article>
                </div>
              </>
            )}

            <section className="admin-asistente" aria-labelledby="asistente-titulo">
              <div className="admin-asistente-cabecera">
                <span className="admin-asistente-etiqueta">Blooming Insights · IA</span>
                <h2 id="asistente-titulo">Asistente IA de Blooming</h2>
                <p className="admin-asistente-texto">
                  Consulta información administrativa y recibe recomendaciones basadas en
                  los datos reales de tu negocio.
                </p>
              </div>

              <ul className="admin-asistente-ideas">
                {IDEAS_ASISTENTE.map((idea) => (
                  <li key={idea}>
                    <button type="button" onClick={() => setPreguntaIA(idea)}>
                      {idea}
                    </button>
                  </li>
                ))}
              </ul>

              <form className="admin-asistente-form" onSubmit={consultarIA}>
                <textarea
                  value={preguntaIA}
                  onChange={(e) => setPreguntaIA(e.target.value)}
                  placeholder="Escribe tu pregunta sobre las ventas, los clientes o el menú..."
                  aria-label="Pregunta para el asistente"
                  rows={4}
                  maxLength={1500}
                  required
                />

                <div className="admin-asistente-pie">
                  <small>{preguntaIA.length}/1500</small>

                  <button type="submit" disabled={cargandoIA}>
                    {cargandoIA ? 'Consultando Gemini...' : 'Consultar a Gemini'}
                  </button>
                </div>
              </form>

              {errorIA && <p role="alert">{errorIA}</p>}

              {respuestaIA && (
                <section className="admin-asistente-respuesta">
                  <span className="admin-asistente-etiqueta">Respuesta de Gemini</span>
                  <p className="admin-asistente-respuesta-texto">{respuestaIA}</p>
                </section>
              )}
            </section>
          </section>
        )}

        {seccion === 'libros' && (
          <section className="admin-contenido">
            <h2>Gestión de libros</h2>

            <form className="admin-formulario" onSubmit={guardarLibroAdmin}>
              <h3>{libroEditando ? 'Editar libro' : 'Agregar libro'}</h3>

              <input
                type="text"
                placeholder="Título del libro"
                value={formularioLibro.titulo}
                onChange={(e) =>
                  actualizarFormularioLibro('titulo', e.target.value)
                }
                required
              />

              <input
                type="text"
                placeholder="Autor"
                value={formularioLibro.autor}
                onChange={(e) =>
                  actualizarFormularioLibro('autor', e.target.value)
                }
                required
              />

              <input
                type="text"
                placeholder="Editorial"
                value={formularioLibro.editorial}
                onChange={(e) =>
                  actualizarFormularioLibro('editorial', e.target.value)
                }
                required
              />

              <input
                type="number"
                placeholder="Precio en COP"
                min="1"
                value={formularioLibro.precio}
                onChange={(e) =>
                  actualizarFormularioLibro('precio', e.target.value)
                }
                required
              />

              <input
                type="number"
                placeholder="Número de páginas"
                min="1"
                value={formularioLibro.paginas}
                onChange={(e) =>
                  actualizarFormularioLibro('paginas', e.target.value)
                }
                required
              />

              <input
                type="number"
                placeholder="Existencias de libros"
                min="0"
                step="1"
                value={formularioLibro.stockLibro}
                onChange={(e) =>
                  actualizarFormularioLibro('stockLibro', e.target.value)
                }
                required
              />

              <input
                type="number"
                placeholder="Existencias de cajitas"
                min="0"
                step="1"
                value={formularioLibro.stockCajita}
                onChange={(e) =>
                  actualizarFormularioLibro('stockCajita', e.target.value)
                }
                required
              />

              <input
                type="text"
                placeholder="Ruta de la imagen"
                value={formularioLibro.imagen}
                onChange={(e) =>
                  actualizarFormularioLibro('imagen', e.target.value)
                }
                required
              />

              <textarea
                placeholder="Sinopsis (un párrafo por línea)"
                value={formularioLibro.sinopsis}
                onChange={(e) =>
                  actualizarFormularioLibro('sinopsis', e.target.value)
                }
                rows="4"
              />

              <input
                type="text"
                placeholder="Nombre de la cajita literaria"
                value={formularioLibro.cajaNombre}
                onChange={(e) =>
                  actualizarFormularioLibro('cajaNombre', e.target.value)
                }
              />

              <textarea
                placeholder="Concepto de la cajita literaria"
                value={formularioLibro.cajaConcepto}
                onChange={(e) =>
                  actualizarFormularioLibro('cajaConcepto', e.target.value)
                }
                rows="3"
              />

              <label>
                <input
                  type="checkbox"
                  checked={formularioLibro.club}
                  onChange={(e) =>
                    actualizarFormularioLibro('club', e.target.checked)
                  }
                />
                Disponible para el club de lectura
              </label>

              <div>
                <button type="submit">
                  {libroEditando ? 'Guardar cambios' : 'Agregar libro'}
                </button>

                {libroEditando && (
                  <button type="button" onClick={cancelarEdicionLibro}>
                    Cancelar
                  </button>
                )}
              </div>
            </form>

            <div>
              <h3>Catálogo ({libros.length})</h3>

              <input
                type="search"
                placeholder="Buscar por título, autor o editorial"
                aria-label="Buscar libros"
                value={busquedaLibro}
                onChange={(e) => setBusquedaLibro(e.target.value)}
              />

              {librosFiltrados.length === 0 ? (
                <p>No se encontraron libros.</p>
              ) : (
                <div>
                  {librosFiltrados.map((libro) => (
                    <article key={libro.id}>
                      <h4>{libro.titulo}</h4>
                      <p>
                        {libro.autor} · {libro.editorial}
                      </p>
                      <p>{formatoCOP(libro.precio)}</p>
                      <p>Libros disponibles: {libro.stockLibro ?? 0}</p>
                      <p>Cajitas disponibles: {libro.stockCajita ?? 0}</p>

                      <div className="admin-libro-cajita">
                        <strong>
                          {libro.cajaNombre || 'Sin cajita configurada'}
                        </strong>
                        <p>
                          {libro.cajaConcepto || 'Sin concepto literario'}
                        </p>
                        <small>
                          {libro.cajaNombre ? 'Cajita configurada' : 'Pendiente de configurar'}
                        </small>
                      </div>

                      <button
                        type="button"
                        onClick={() => editarLibroAdmin(libro)}
                      >
                        Editar
                      </button>

                      <button
                        type="button"
                        onClick={() => eliminarLibroAdmin(libro.id)}
                      >
                        Eliminar
                      </button>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {seccion === 'menu' && (
          <section className="admin-contenido">
            <h2>Gestión del menú</h2>

            <form
              className="admin-formulario"
              onSubmit={guardarElementoMenu}
            >
              <h3>
                {elementoEditando ? 'Editar elemento' : 'Agregar elemento'}
              </h3>

              <select
                value={tipoElemento}
                aria-label="Tipo de elemento"
                disabled={Boolean(elementoEditando)}
                onChange={(e) => setTipoElemento(e.target.value)}
              >
                <option value="producto">Producto</option>
                <option value="combo">Combo</option>
                <option value="especial">Especial</option>
              </select>

              {tipoElemento === 'producto' && (
                <select
                  value={categoriaSeleccionada}
                  aria-label="Categoría del producto"
                  disabled={Boolean(elementoEditando)}
                  onChange={(e) =>
                    setCategoriaSeleccionada(e.target.value)
                  }
                >
                  {menuAdmin.categorias.map((categoria) => (
                    <option key={categoria.id} value={categoria.id}>
                      {categoria.titulo}
                    </option>
                  ))}
                </select>
              )}

              <input
                type="text"
                placeholder="Nombre"
                value={formularioMenu.nombre}
                onChange={(e) =>
                  actualizarFormularioMenu('nombre', e.target.value)
                }
                required
              />

              {tipoElemento === 'combo' && (
                <textarea
                  placeholder="Detalle del combo"
                  value={formularioMenu.detalle}
                  onChange={(e) =>
                    actualizarFormularioMenu('detalle', e.target.value)
                  }
                  rows="2"
                />
              )}

              {tipoElemento === 'especial' && (
                <input
                  type="text"
                  placeholder="Cita"
                  value={formularioMenu.cita}
                  onChange={(e) =>
                    actualizarFormularioMenu('cita', e.target.value)
                  }
                />
              )}

              {tipoElemento !== 'combo' && (
                <>
                  <textarea
                    placeholder="Descripción"
                    value={formularioMenu.descripcion}
                    onChange={(e) =>
                      actualizarFormularioMenu('descripcion', e.target.value)
                    }
                    rows="3"
                  />

                  <input
                    type="text"
                    placeholder="Etiquetas"
                    value={formularioMenu.etiquetas}
                    onChange={(e) =>
                      actualizarFormularioMenu('etiquetas', e.target.value)
                    }
                  />
                </>
              )}

              <input
                type="number"
                placeholder="Precio en COP"
                min="1"
                value={formularioMenu.precio}
                onChange={(e) =>
                  actualizarFormularioMenu('precio', e.target.value)
                }
                required
              />

              <div>
                <button type="submit">
                  {elementoEditando ? 'Guardar cambios' : 'Agregar elemento'}
                </button>

                {elementoEditando && (
                  <button type="button" onClick={cancelarEdicionMenu}>
                    Cancelar
                  </button>
                )}
              </div>
            </form>

            <div>
              <h3>Combos ({menuAdmin.combos.length})</h3>

              {menuAdmin.combos.map((combo) => (
                <article key={combo.id}>
                  <h4>{combo.nombre}</h4>
                  <p>{combo.detalle}</p>
                  <p>{formatoCOP(combo.precio)}</p>

                  <button
                    type="button"
                    onClick={() => editarElementoMenu(combo, 'combo')}
                  >
                    Editar
                  </button>

                  <button
                    type="button"
                    onClick={() => eliminarElementoMenu(combo, 'combo')}
                  >
                    Eliminar
                  </button>
                </article>
              ))}
            </div>

            <div>
              <h3>Productos por categoría</h3>

              {menuAdmin.categorias.map((categoria) => (
                <div key={categoria.id}>
                  <h4>{categoria.titulo}</h4>

                  {categoria.items.map((item) => (
                    <article key={item.nombre}>
                      <h4>{item.nombre}</h4>
                      <p>{item.descripcion}</p>
                      <p>{formatoCOP(item.precio)}</p>

                      <button
                        type="button"
                        onClick={() =>
                          editarElementoMenu(
                            item,
                            'producto',
                            categoria.id
                          )
                        }
                      >
                        Editar
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          eliminarElementoMenu(
                            item,
                            'producto',
                            categoria.id
                          )
                        }
                      >
                        Eliminar
                      </button>
                    </article>
                  ))}
                </div>
              ))}
            </div>

            <div>
              <h3>Especiales ({menuAdmin.especiales.length})</h3>

              {menuAdmin.especiales.map((especial) => (
                <article key={especial.id}>
                  <h4>{especial.nombre}</h4>
                  <p>{especial.cita}</p>
                  <p>{especial.descripcion}</p>
                  <p>{formatoCOP(especial.precio)}</p>

                  <button
                    type="button"
                    onClick={() =>
                      editarElementoMenu(especial, 'especial')
                    }
                  >
                    Editar
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      eliminarElementoMenu(especial, 'especial')
                    }
                  >
                    Eliminar
                  </button>
                </article>
              ))}
            </div>
          </section>
        )}

        {seccion === 'eventos' && (
          <section className="admin-contenido">
            <h2>{eventoEditando ? 'Editar evento' : 'Gestión de eventos'}</h2>

            <form className="admin-formulario" onSubmit={guardarEventoAdmin}>
              <input
                type="text"
                placeholder="Título del evento"
                value={formularioEvento.titulo}
                onChange={(e) =>
                  actualizarFormularioEvento('titulo', e.target.value)
                }
                required
              />

              <div>
                <label htmlFor="evento-fecha">Fecha</label>
                <input
                  id="evento-fecha"
                  type="date"
                  value={formularioEvento.fecha}
                  onChange={(e) =>
                    actualizarFormularioEvento('fecha', e.target.value)
                  }
                  required
                />
              </div>

              <select
                value={formularioEvento.tipo}
                aria-label="Tipo de evento"
                onChange={(e) =>
                  actualizarFormularioEvento('tipo', e.target.value)
                }
              >
                <option value="evento">Evento</option>
                <option value="club">Club de lectura</option>
              </select>

              <input
                type="text"
                placeholder="Categoría"
                value={formularioEvento.categoria}
                onChange={(e) =>
                  actualizarFormularioEvento('categoria', e.target.value)
                }
              />

              <input
                type="time"
                aria-label="Hora del evento"
                value={formularioEvento.hora}
                onChange={(e) =>
                  actualizarFormularioEvento('hora', e.target.value)
                }
              />

              <input
                type="text"
                placeholder="Duración"
                value={formularioEvento.duracion}
                onChange={(e) =>
                  actualizarFormularioEvento('duracion', e.target.value)
                }
              />

              <input
                type="text"
                placeholder="Lugar"
                value={formularioEvento.lugar}
                onChange={(e) =>
                  actualizarFormularioEvento('lugar', e.target.value)
                }
              />

              <input
                type="text"
                placeholder="Imagen (ruta o URL)"
                value={formularioEvento.imagen}
                onChange={(e) =>
                  actualizarFormularioEvento('imagen', e.target.value)
                }
              />

              <input
                type="text"
                placeholder="Persona que dirige"
                value={formularioEvento.dirige}
                onChange={(e) =>
                  actualizarFormularioEvento('dirige', e.target.value)
                }
              />

              {formularioEvento.tipo === 'club' && (
                <>
                  <select
                    value={formularioEvento.libroId || ''}
                    aria-label="Libro del club de lectura"
                    onChange={(e) =>
                      actualizarFormularioEvento('libroId', e.target.value)
                    }
                  >
                    <option value="">Seleccionar libro</option>
                    {libros.map((libro) => (
                      <option key={libro.id} value={libro.id}>
                        {libro.titulo}
                      </option>
                    ))}
                  </select>

                  <textarea
                    placeholder="Información de la lectura"
                    value={formularioEvento.lectura}
                    onChange={(e) =>
                      actualizarFormularioEvento('lectura', e.target.value)
                    }
                    rows="3"
                  />
                </>
              )}

              <input
                type="number"
                min="0"
                placeholder="Precio"
                value={formularioEvento.precio}
                onChange={(e) =>
                  actualizarFormularioEvento('precio', e.target.value)
                }
              />

              <input
                type="number"
                min="0"
                placeholder="Número de cupos"
                value={formularioEvento.cupos}
                onChange={(e) =>
                  actualizarFormularioEvento('cupos', e.target.value)
                }
              />

              <textarea
                placeholder="Descripción (un párrafo por línea)"
                value={formularioEvento.descripcion}
                onChange={(e) =>
                  actualizarFormularioEvento('descripcion', e.target.value)
                }
                rows="4"
              />

              <textarea
                placeholder="Qué incluye (un elemento por línea)"
                value={formularioEvento.incluye}
                onChange={(e) =>
                  actualizarFormularioEvento('incluye', e.target.value)
                }
                rows="4"
              />

              <button type="submit">
                {eventoEditando ? 'Guardar cambios' : 'Crear evento'}
              </button>

              {eventoEditando && (
                <button type="button" onClick={cancelarEdicionEvento}>
                  Cancelar edición
                </button>
              )}
            </form>

            <h2>Eventos registrados ({eventosOrdenados.length})</h2>

            <div>
              {eventosOrdenados.map((evento) => (
                <article key={evento.id}>
                  <h3>{evento.titulo}</h3>
                  <p>{evento.categoria}</p>
                  <p>
                    {evento.fecha} · {evento.hora}
                  </p>
                  <p>{formatoCOP(evento.precio)}</p>
                  <p>Cupos: {evento.cupos}</p>

                  <button
                    type="button"
                    onClick={() => editarEventoAdmin(evento)}
                  >
                    Editar
                  </button>

                  <button
                    type="button"
                    onClick={() => eliminarEventoAdmin(evento.id)}
                  >
                    Eliminar
                  </button>
                </article>
              ))}
            </div>

            {eventosOrdenados.length === 0 && (
              <p>No hay eventos registrados.</p>
            )}
          </section>
        )}

        {seccion === 'contacto' && (
          <section className="admin-contenido">
            <h2>Gestión de contacto</h2>

            <div className="admin-lista">
              {mensajesContacto.length > 0 ? (
                mensajesContacto.map((mensaje) => (
                  <article className="admin-tarjeta" key={mensaje.id}>
                    <div className="admin-tarjeta-header">
                      <div>
                        <h3>{mensaje.nombre}</h3>
                        <p>{mensaje.email}</p>
                      </div>

                      <span className={`estado estado-${mensaje.estado}`}>
                        {mensaje.estado === 'nuevo'
                          ? 'Nuevo'
                          : mensaje.estado === 'leido'
                            ? 'Leído'
                            : 'Respondido'}
                      </span>
                    </div>

                    <p>
                      <strong>Fecha:</strong>{' '}
                      {new Date(mensaje.fecha).toLocaleString('es-CO')}
                    </p>

                    <p className="admin-mensaje-texto">{mensaje.mensaje}</p>

                    <div className="admin-acciones">
                      <button
                        type="button"
                        onClick={() =>
                          actualizarEstadoMensaje(mensaje.id, 'leido')
                        }
                        disabled={mensaje.estado === 'leido'}
                      >
                        Marcar como leído
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          actualizarEstadoMensaje(mensaje.id, 'respondido')
                        }
                        disabled={mensaje.estado === 'respondido'}
                      >
                        Marcar como respondido
                      </button>

                      <a
                        href={`mailto:${mensaje.email}?subject=${encodeURIComponent(
                          'Respuesta de Blooming'
                        )}`}
                      >
                        Responder
                      </a>

                      <button
                        type="button"
                        onClick={() => {
                          if (
                            window.confirm(
                              '¿Seguro que deseas eliminar este mensaje?'
                            )
                          ) {
                            eliminarMensaje(mensaje.id);
                          }
                        }}
                      >
                        Eliminar
                      </button>
                    </div>
                  </article>
                ))
              ) : (
                <p>
                  Todavía no hay mensajes de contacto. Cuando alguien
                  escriba desde el formulario, aparecerá aquí.
                </p>
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}