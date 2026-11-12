# Blooming — Café & Libros

**Blooming** es una plataforma web para una cafetería-librería que combina la experiencia del café con el mundo de la literatura. Permite descubrir libros, explorar productos, conocer actividades culturales y gestionar pedidos desde una experiencia digital.

El proyecto integra una aplicación frontend y un backend propio conectado a una base de datos.

## Tecnologías

### Frontend
- React 19
- Vite 8
- JavaScript
- React Router 7
- Recharts
- qrcode.react
- CSS3

### Backend
- Node.js
- Express 5
- MongoDB
- Mongoose
- JSON Web Tokens (JWT)
- bcryptjs
- Google GenAI
- Resend
- dotenv
- CORS

## Funcionalidades

### Experiencia del cliente
- Exploración del catálogo de libros.
- Consulta del menú de productos.
- Información sobre eventos y clubes de lectura.
- Carrito de compras.
- Registro e inicio de sesión.
- Recuperación y restablecimiento de contraseña.
- Administración de la cuenta personal.
- Consulta de pedidos y puntos.

### Panel de administración
- Gestión de libros y productos.
- Administración de eventos.
- Consulta y gestión de pedidos.
- Consulta de clientes.
- Estadísticas comerciales y de ventas.

### Backend
- API REST con Express.
- Conexión con MongoDB mediante Mongoose.
- Autenticación y autorización.
- Encriptación de contraseñas.
- Gestión de pedidos.
- Envío de correos electrónicos.
- Integración con Google GenAI.

## Estructura del repositorio

```text
Repositorio/
│
├── blooming-react/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── data/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── services/
│   │   └── utils/
│   ├── package.json
│   └── vite.config.js
│
├── blooming-backend/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── server.js
│   └── package.json
│
└── README.md
```

## Instalación

### Requisitos
- Node.js
- npm
- Una base de datos MongoDB.

### 1. Clonar el repositorio

```bash
git clone URL_DEL_REPOSITORIO
cd REPOSITORIO
```

### 2. Configurar el backend

```bash
cd blooming-backend
npm install
```

Configurar las variables de entorno necesarias en el archivo `.env`.

Iniciar el servidor:

```bash
npm run dev
```

### 3. Configurar el frontend

Abrir otra terminal:

```bash
cd blooming-react
npm install
```

Iniciar la aplicación:

```bash
npm run dev
```

### 4. Compilación de producción

Desde `blooming-react`:

```bash
npm run lint
npm run build
```

## Seguridad

- Las contraseñas se procesan mediante bcryptjs.
- La autenticación utiliza JWT.
- Las credenciales y variables privadas deben almacenarse en archivos `.env`.
- Los archivos `.env` y las carpetas `node_modules` no deben publicarse en GitHub.

## Estado del proyecto

Blooming se encuentra en desarrollo, con frontend y backend integrados progresivamente.

## Autora

Cesia Márquez- Proyecto Blooming, Café & Libros.