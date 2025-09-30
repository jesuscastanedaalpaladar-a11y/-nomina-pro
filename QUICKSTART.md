# 🚀 QuickStart - Integración API en PaySync

## ✅ ¿Qué se agregó?

Tu proyecto **PaySync** ahora tiene toda la infraestructura para conectarse con APIs externas:

### 📦 Archivos Creados

```
✅ lib/env.ts              - Validación de variables de entorno (Zod)
✅ lib/api.ts              - Cliente API con fetch + Bearer token
✅ lib/pagination.ts       - Helpers de paginación
✅ components/ui/Table.tsx - Tabla genérica con ordenamiento
✅ components/ui/Pagination.tsx - Controles de paginación
✅ src/pages/ProductsPage.tsx - Ejemplo completo de página
✅ vite-env.d.ts          - Tipos de TypeScript para Vite
✅ API_INTEGRATION.md     - Documentación completa
```

## 🎯 Uso Rápido

### 1. Configurar Variables de Entorno

Crea `.env.local` en la raíz:

```env
VITE_API_URL=http://localhost:3001
```

### 2. Consumir API

```typescript
import { apiGet } from './lib/api';

// GET con paginación
const products = await apiGet('/products', {
  params: { page: 1, pageSize: 10, sortBy: 'name', sortOrder: 'asc' }
});

// Con autenticación
const data = await apiGet('/protected', {
  token: 'your-bearer-token'
});
```

### 3. Usar Componentes

```tsx
import Table from './components/ui/Table';
import Pagination from './components/ui/Pagination';

<Table
  data={items}
  columns={[
    { key: 'name', header: 'Nombre', sortable: true },
    { key: 'price', header: 'Precio', sortable: true }
  ]}
  onSort={handleSort}
/>

<Pagination
  currentPage={1}
  totalPages={10}
  pageSize={10}
  total={100}
  onPageChange={setPage}
  onPageSizeChange={setPageSize}
/>
```

## 🔧 Comando de Desarrollo

```bash
npm run dev
```

## 📖 Documentación Completa

Lee `API_INTEGRATION.md` para:
- Ejemplos detallados de uso
- Contrato de la API esperado
- Tips de integración
- Troubleshooting

## 💡 Próximo Paso

1. Configura tu backend (Node/Fastify)
2. Actualiza `VITE_API_URL` en `.env.local`
3. Usa `ProductsPage.tsx` como referencia
4. Crea tus propias páginas siguiendo el patrón

---

**Todo listo para integrar con tu API externa** 🎉
