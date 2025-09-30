import { getApiUrl } from './env';

// Tipo para opciones de fetch
interface ApiFetchOptions extends RequestInit {
  token?: string;
  params?: Record<string, string | number | boolean | undefined>;
}

// Tipo genérico para respuestas paginadas
export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

// Helper para construir query params
function buildQueryString(params?: Record<string, string | number | boolean | undefined>): string {
  if (!params) return '';
  
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  });
  
  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}

// Función principal para hacer peticiones GET
export async function apiGet<T>(
  endpoint: string,
  options?: ApiFetchOptions
): Promise<T> {
  const { token, params, ...fetchOptions } = options || {};
  
  const baseUrl = getApiUrl();
  const queryString = buildQueryString(params);
  const url = `${baseUrl}/api/v1${endpoint}${queryString}`;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...fetchOptions.headers,
  };
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers,
      cache: 'no-store', // Evitar cache
      ...fetchOptions,
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Error ${response.status}: ${response.statusText}`
      );
    }
    
    return await response.json();
  } catch (error) {
    console.error(`API Error en ${endpoint}:`, error);
    throw error;
  }
}

// Función para POST
export async function apiPost<T>(
  endpoint: string,
  data: unknown,
  options?: ApiFetchOptions
): Promise<T> {
  const { token, ...fetchOptions } = options || {};
  
  const baseUrl = getApiUrl();
  const url = `${baseUrl}/api/v1${endpoint}`;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...fetchOptions.headers,
  };
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
      cache: 'no-store',
      ...fetchOptions,
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Error ${response.status}: ${response.statusText}`
      );
    }
    
    return await response.json();
  } catch (error) {
    console.error(`API Error en ${endpoint}:`, error);
    throw error;
  }
}

// Función para PUT
export async function apiPut<T>(
  endpoint: string,
  data: unknown,
  options?: ApiFetchOptions
): Promise<T> {
  const { token, ...fetchOptions } = options || {};
  
  const baseUrl = getApiUrl();
  const url = `${baseUrl}/api/v1${endpoint}`;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...fetchOptions.headers,
  };
  
  try {
    const response = await fetch(url, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
      cache: 'no-store',
      ...fetchOptions,
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Error ${response.status}: ${response.statusText}`
      );
    }
    
    return await response.json();
  } catch (error) {
    console.error(`API Error en ${endpoint}:`, error);
    throw error;
  }
}

// Función para DELETE
export async function apiDelete<T>(
  endpoint: string,
  options?: ApiFetchOptions
): Promise<T> {
  const { token, ...fetchOptions } = options || {};
  
  const baseUrl = getApiUrl();
  const url = `${baseUrl}/api/v1${endpoint}`;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...fetchOptions.headers,
  };
  
  try {
    const response = await fetch(url, {
      method: 'DELETE',
      headers,
      cache: 'no-store',
      ...fetchOptions,
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Error ${response.status}: ${response.statusText}`
      );
    }
    
    return await response.json();
  } catch (error) {
    console.error(`API Error en ${endpoint}:`, error);
    throw error;
  }
}

// Helper para obtener el token de autenticación (desde localStorage, cookie, etc.)
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('authToken');
}

// Helper para establecer el token de autenticación
export function setAuthToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('authToken', token);
}

// Helper para remover el token de autenticación
export function removeAuthToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('authToken');
}
