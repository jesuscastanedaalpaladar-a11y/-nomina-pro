import React, { useState, useEffect } from 'react';
import { apiGet, PaginatedResponse } from '../../lib/api';
import { normalizePaginationParams, PaginationParams } from '../../lib/pagination';
import Table, { Column } from '../../components/ui/Table';
import Pagination from '../../components/ui/Pagination';

// Tipo para Product
export interface Product {
  id: string;
  name: string;
  priceCents: number;
  createdAt: string;
  updatedAt?: string;
  description?: string;
  stock?: number;
}

// Tipo para la respuesta de la API
export type ProductsResponse = PaginatedResponse<Product>;

export function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estado de paginación y ordenamiento
  const [paginationParams, setPaginationParams] = useState<PaginationParams>({
    page: 1,
    pageSize: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });
  
  const [paginationInfo, setPaginationInfo] = useState({
    total: 0,
    totalPages: 0,
  });

  // Cargar productos desde la API
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiGet<ProductsResponse>('/products', {
        params: paginationParams,
      });
      
      setProducts(response.items);
      setPaginationInfo({
        total: response.total,
        totalPages: response.totalPages,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar productos');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  // Cargar productos cuando cambien los parámetros
  useEffect(() => {
    fetchProducts();
  }, [paginationParams]);

  // Manejador de cambio de página
  const handlePageChange = (page: number) => {
    setPaginationParams((prev) => ({ ...prev, page }));
  };

  // Manejador de cambio de tamaño de página
  const handlePageSizeChange = (pageSize: number) => {
    setPaginationParams((prev) => ({ ...prev, pageSize, page: 1 }));
  };

  // Manejador de ordenamiento
  const handleSort = (column: string) => {
    setPaginationParams((prev) => ({
      ...prev,
      sortBy: column,
      sortOrder: prev.sortBy === column && prev.sortOrder === 'asc' ? 'desc' : 'asc',
    }));
  };

  // Formatear precio en centavos a dólares
  const formatPrice = (priceCents: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'USD',
    }).format(priceCents / 100);
  };

  // Formatear fecha
  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateString));
  };

  // Definir columnas de la tabla
  const columns: Column<Product>[] = [
    {
      key: 'name',
      header: 'Nombre',
      sortable: true,
      render: (value) => <span className="font-semibold">{value}</span>,
    },
    {
      key: 'priceCents',
      header: 'Precio',
      sortable: true,
      render: (value) => (
        <span className="text-green-600 font-medium">{formatPrice(value)}</span>
      ),
    },
    {
      key: 'stock',
      header: 'Stock',
      sortable: true,
      render: (value) => {
        if (value === undefined || value === null) return '-';
        const stockClass = value > 10 ? 'text-green-600' : value > 0 ? 'text-yellow-600' : 'text-red-600';
        return <span className={`font-medium ${stockClass}`}>{value}</span>;
      },
    },
    {
      key: 'createdAt',
      header: 'Fecha de Creación',
      sortable: true,
      render: (value) => <span className="text-gray-600 text-sm">{formatDate(value)}</span>,
    },
    {
      key: 'id',
      header: 'Acciones',
      render: (_, row) => (
        <div className="flex gap-2">
          <button
            onClick={() => alert(`Ver detalles de: ${row.name}`)}
            className="px-3 py-1 text-xs font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
          >
            Ver
          </button>
          <button
            onClick={() => alert(`Editar: ${row.name}`)}
            className="px-3 py-1 text-xs font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Editar
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Productos</h1>
          <p className="text-gray-600">
            Gestiona el catálogo de productos de tu empresa
          </p>
        </div>

        {/* Acciones */}
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={fetchProducts}
              disabled={loading}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <span>🔄</span>
              Recargar
            </button>
          </div>
          
          <button
            onClick={() => alert('Agregar nuevo producto')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <span>+</span>
            Nuevo Producto
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 font-medium">❌ {error}</p>
          </div>
        )}

        {/* Tabla */}
        <Table<Product>
          data={products}
          columns={columns}
          sortBy={paginationParams.sortBy}
          sortOrder={paginationParams.sortOrder}
          onSort={handleSort}
          loading={loading}
          emptyMessage="No hay productos disponibles"
          className="mb-6"
        />

        {/* Paginación */}
        {!loading && products.length > 0 && (
          <Pagination
            currentPage={paginationParams.page}
            totalPages={paginationInfo.totalPages}
            pageSize={paginationParams.pageSize}
            total={paginationInfo.total}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        )}
      </div>
    </div>
  );
}

export default ProductsPage;
