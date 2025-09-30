# 🚀 Integración con API Externa - PaySync

## 📋 Descripción

Este proyecto ahora incluye una arquitectura completa para conectarse con APIs externas (Node/Fastify) con:

- ✅ Validación de variables de entorno con Zod
- ✅ Cliente API con soporte de Bearer token
- ✅ Helpers de paginación
- ✅ Componentes UI genéricos (Table, Pagination)
- ✅ Página de ejemplo de productos

## 📁 Estructura de Archivos Creados

```
nomina-pro/
├── lib/
│   ├── env.ts              # Validación de variables de entorno con Zod
│   ├── api.ts              # Cliente API con fetch (GET, POST, PUT, DELETE)
│   └── pagination.ts       # Helpers de paginación
├── components/
│   └── ui/
│       ├── Table.tsx       # Componente de tabla genérica
│       └── Pagination.tsx  # Componente de paginación
├── src/
│   └── pages/
│       └── ProductsPage.tsx # Página de ejemplo de productos
└── .env.example            # Variables de entorno (bloqueado por .gitignore)
```

## 🔧 Configuración

### 1. Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```env
# Backend API URL
VITE_API_URL=http://localhost:3001

# Supabase (opcional)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Firebase (ya configurado)
VITE_FIREBASE_API_KEY=AIzaSyBKwJeYdmymvuAqTuVTE8_Mlc0D18bDC_8
VITE_FIREBASE_AUTH_DOMAIN=nomina-pro.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://nomina-pro-default-rtdb.firebaseio.com
VITE_FIREBASE_PROJECT_ID=nomina-pro
VITE_FIREBASE_STORAGE_BUCKET=nomina-pro.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=542069260503
VITE_FIREBASE_APP_ID=1:542069260503:web:2044f09f09966ec1493092
```

### 2. Instalación

```bash
npm install
```

### 3. Desarrollo

```bash
npm run dev
```

## 📚 Uso de los Módulos

### `lib/env.ts` - Validación de Variables de Entorno

```typescript
import { env, getApiUrl } from './lib/env';

// Obtener URL de la API
const apiUrl = getApiUrl();
console.log(apiUrl); // http://localhost:3001
```

### `lib/api.ts` - Cliente API

```typescript
import { apiGet, apiPost, apiPut, apiDelete, setAuthToken } from './lib/api';

// GET request
const products = await apiGet('/products', {
  params: { page: 1, pageSize: 10 },
  token: 'your-bearer-token', // Opcional
});

// POST request
const newProduct = await apiPost('/products', {
  name: 'Producto Nuevo',
  priceCents: 9999,
});

// PUT request
const updatedProduct = await apiPut('/products/123', {
  name: 'Producto Actualizado',
});

// DELETE request
await apiDelete('/products/123');

// Guardar token de autenticación
setAuthToken('your-bearer-token');
```

### `lib/pagination.ts` - Helpers de Paginación

```typescript
import {
  calculatePagination,
  getPaginationRange,
  normalizePaginationParams,
} from './lib/pagination';

// Calcular información de paginación
const paginationInfo = calculatePagination(100, 1, 10);
// { page: 1, pageSize: 10, total: 100, totalPages: 10, hasNextPage: true, hasPrevPage: false }

// Generar array de páginas para mostrar
const pages = getPaginationRange(5, 10);
// [1, '...', 3, 4, 5, 6, 7, '...', 10]

// Normalizar parámetros
const params = normalizePaginationParams({ page: '5', pageSize: '25' });
// { page: 5, pageSize: 25, sortBy: 'createdAt', sortOrder: 'desc' }
```

### Componentes UI

#### `Table.tsx` - Tabla Genérica

```typescript
import Table, { Column } from './components/ui/Table';

interface Product {
  id: string;
  name: string;
  price: number;
}

const columns: Column<Product>[] = [
  {
    key: 'name',
    header: 'Nombre',
    sortable: true,
  },
  {
    key: 'price',
    header: 'Precio',
    sortable: true,
    render: (value) => `$${value.toFixed(2)}`,
  },
];

<Table
  data={products}
  columns={columns}
  sortBy="name"
  sortOrder="asc"
  onSort={handleSort}
  loading={false}
/>
```

#### `Pagination.tsx` - Paginación

```typescript
import Pagination from './components/ui/Pagination';

<Pagination
  currentPage={1}
  totalPages={10}
  pageSize={10}
  total={100}
  onPageChange={handlePageChange}
  onPageSizeChange={handlePageSizeChange}
/>
```

## 🎯 Página de Ejemplo: Productos

La página `src/pages/ProductsPage.tsx` es un ejemplo completo que muestra:

- ✅ Integración con API externa (`GET /api/v1/products`)
- ✅ Tabla de productos con ordenamiento
- ✅ Paginación completa
- ✅ Manejo de estados de carga y error
- ✅ Formateo de datos (precios, fechas)
- ✅ Acciones por registro

### Contrato de la API Esperado

```typescript
// GET /api/v1/products?page=1&pageSize=10&sortBy=createdAt&sortOrder=desc

// Response
{
  "items": [
    {
      "id": "1",
      "name": "Producto 1",
      "priceCents": 9999,
      "stock": 50,
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  ],
  "page": 1,
  "pageSize": 10,
  "total": 100,
  "totalPages": 10
}
```

## 🔌 Integración con tu HTML Actual

Para integrar la página de productos en tu `dist/index.html`, necesitarías:

1. **Agregar React Router** o un sistema de rutas
2. **Crear un punto de montaje** en el HTML para React
3. **Migrar gradualmente** las páginas de HTML vanilla a React

### Opción 1: Migración Gradual (Recomendado)

Puedes mantener tu HTML actual y montar componentes React en contenedores específicos:

```html
<!-- En dist/index.html -->
<div id="products-page" class="page hidden"></div>

<script type="module">
  import { createRoot } from 'react-dom/client';
  import ProductsPage from './src/pages/ProductsPage';
  
  const container = document.getElementById('products-page');
  const root = createRoot(container);
  root.render(<ProductsPage />);
</script>
```

### Opción 2: SPA Completo con React Router

Migrar completamente a una Single Page Application con React Router.

## 🎨 Estilos

Los componentes usan Tailwind CSS (ya configurado en tu proyecto). Si necesitas estilos adicionales, puedes:

1. Modificar `tailwind.config.js`
2. Agregar clases en `src/index.css`
3. Usar CSS Modules

## 🔐 Autenticación

El cliente API soporta Bearer tokens. Para usar autenticación:

```typescript
import { setAuthToken, apiGet } from './lib/api';

// Después del login
setAuthToken('your-jwt-token');

// Las peticiones automáticamente incluirán el header:
// Authorization: Bearer your-jwt-token
const data = await apiGet('/protected-endpoint');
```

## 🧪 Testing

Para probar la integración sin un backend real, puedes:

1. **Usar JSON Server** para mock data
2. **MSW (Mock Service Worker)** para interceptar requests
3. **Modificar `lib/api.ts`** para retornar datos de prueba

Ejemplo con datos mock:

```typescript
// lib/api.ts (temporal para testing)
export async function apiGet<T>(endpoint: string): Promise<T> {
  // Mock data para testing
  if (endpoint === '/products') {
    return {
      items: [
        { id: '1', name: 'Producto 1', priceCents: 9999, createdAt: new Date().toISOString() },
        { id: '2', name: 'Producto 2', priceCents: 14999, createdAt: new Date().toISOString() },
      ],
      page: 1,
      pageSize: 10,
      total: 2,
      totalPages: 1,
    } as T;
  }
  
  // Resto del código...
}
```

## 📦 Dependencias Agregadas

```json
{
  "dependencies": {
    "zod": "^3.23.8"
  }
}
```

## 🚀 Próximos Pasos

1. **Configurar tu backend** Node/Fastify
2. **Actualizar** `VITE_API_URL` en `.env.local`
3. **Probar** la página de productos
4. **Crear** nuevas páginas siguiendo el patrón de `ProductsPage.tsx`
5. **Migrar** gradualmente las páginas HTML a React

## 💡 Tips

- Usa `no-store` en fetch para evitar cache (ya configurado)
- Los tipos TypeScript están definidos para autocompletado
- Tailwind CSS optimiza el bundle eliminando clases no usadas
- La validación de Zod previene errores de configuración

## 🐛 Troubleshooting

### Error: "VITE_API_URL must be a valid URL"
→ Verifica que `.env.local` existe y tiene la variable correcta.

### Error: "Failed to fetch"
→ Verifica que tu backend está corriendo y la URL es correcta.

### CORS Error
→ Configura CORS en tu backend Fastify:
```javascript
await fastify.register(cors, {
  origin: 'http://localhost:5173' // Tu URL de Vite
});
```

## 📞 Soporte

Si tienes dudas o problemas, revisa:
- La documentación de tipos en cada archivo
- Los comentarios inline en el código
- Los ejemplos en `ProductsPage.tsx`

---

**Hecho con ❤️ para PaySync**
