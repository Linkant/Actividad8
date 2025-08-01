# Sistema de Gestión de Inventario

## Descripción
Aplicación web completa para la administración del inventario de una empresa o negocio. Incluye funcionalidades CRUD, autenticación de usuarios, control de stock y diseño responsivo.

## Tecnologías Utilizadas

### Backend
- Node.js con Express.js
- MySQL como base de datos
- JWT para autenticación
- bcrypt para hash de contraseñas
- CORS para comunicación frontend-backend

### Frontend
- React.js
- Tailwind CSS para diseño responsivo
- Axios para comunicación con API
- React Router para navegación

## Estructura del Proyecto

```
inventario-app/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   └── utils/
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── utils/
│   └── package.json
└── database/
    └── schema.sql

```

## Modelo de Datos

### Entidades Principales
1. **Usuarios** - Gestión de autenticación y roles
2. **Categorías** - Clasificación de productos
3. **Productos** - Inventario principal
4. **Movimientos** - Historial de entradas y salidas

## Instalación

### Backend
```bash
cd backend
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm start
```

## Funcionalidades

### Autenticación
- [x] Registro de usuarios
- [x] Login/logout
- [x] Protección de rutas

### Gestión de Productos
- [x] Crear productos
- [x] Listar productos
- [x] Actualizar productos
- [x] Eliminar productos
- [x] Control de stock

### Dashboard
- [x] Resumen del inventario
- [x] Productos con stock bajo
- [x] Últimos movimientos

### Funcionalidades Extras
- [x] Filtros de búsqueda
- [x] Paginación
- [x] Diseño responsivo
- [x] Validación de formularios

## API Endpoints

### Autenticación
- POST `/api/auth/register` - Registro de usuario
- POST `/api/auth/login` - Inicio de sesión

### Productos
- GET `/api/products` - Obtener todos los productos
- POST `/api/products` - Crear producto
- PUT `/api/products/:id` - Actualizar producto
- DELETE `/api/products/:id` - Eliminar producto

### Categorías
- GET `/api/categories` - Obtener categorías
- POST `/api/categories` - Crear categoría

### Movimientos
- GET `/api/movements` - Obtener historial
- POST `/api/movements` - Registrar movimiento
