// Tipos para paginación
export interface PaginationParams {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationInfo {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// Calcular información de paginación
export function calculatePagination(
  total: number,
  page: number,
  pageSize: number
): PaginationInfo {
  const totalPages = Math.ceil(total / pageSize);
  
  return {
    page,
    pageSize,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}

// Generar array de números de página para mostrar
export function getPaginationRange(
  currentPage: number,
  totalPages: number,
  maxButtons: number = 7
): (number | '...')[] {
  if (totalPages <= maxButtons) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  
  const halfButtons = Math.floor(maxButtons / 2);
  const showLeftEllipsis = currentPage > halfButtons + 1;
  const showRightEllipsis = currentPage < totalPages - halfButtons;
  
  if (!showLeftEllipsis && showRightEllipsis) {
    // Inicio: [1, 2, 3, 4, 5, ..., 10]
    return [
      ...Array.from({ length: maxButtons - 2 }, (_, i) => i + 1),
      '...',
      totalPages,
    ];
  }
  
  if (showLeftEllipsis && !showRightEllipsis) {
    // Final: [1, ..., 6, 7, 8, 9, 10]
    return [
      1,
      '...',
      ...Array.from({ length: maxButtons - 2 }, (_, i) => totalPages - (maxButtons - 3) + i),
    ];
  }
  
  if (showLeftEllipsis && showRightEllipsis) {
    // Medio: [1, ..., 4, 5, 6, ..., 10]
    return [
      1,
      '...',
      ...Array.from({ length: maxButtons - 4 }, (_, i) => currentPage - halfButtons + 1 + i),
      '...',
      totalPages,
    ];
  }
  
  // Default: todas las páginas
  return Array.from({ length: totalPages }, (_, i) => i + 1);
}

// Validar y normalizar parámetros de paginación
export function normalizePaginationParams(params: Partial<PaginationParams>): PaginationParams {
  const page = Math.max(1, Number(params.page) || 1);
  const pageSize = Math.min(100, Math.max(1, Number(params.pageSize) || 10));
  const sortBy = params.sortBy || 'createdAt';
  const sortOrder = params.sortOrder === 'asc' ? 'asc' : 'desc';
  
  return { page, pageSize, sortBy, sortOrder };
}

// Calcular offset para consultas SQL
export function calculateOffset(page: number, pageSize: number): number {
  return (page - 1) * pageSize;
}

// Opciones comunes de tamaño de página
export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const;

// Tamaño de página por defecto
export const DEFAULT_PAGE_SIZE = 10;
