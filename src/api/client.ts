// src/api/client.ts
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

export const API_BASE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL) ||
  (typeof process !== 'undefined' && process.env?.VITE_API_BASE_URL) ||
  '/api/v1';

export interface ApiResponse<T> {
  status: number;
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface RequestOptions extends RequestInit {
  params?: Record<string, any>;
}

/**
 * Helper to reliably retrieve active auth JWT token from LocalStorage
 */
export function getActiveAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  const directToken = localStorage.getItem('buildtwin_token') || localStorage.getItem('token');
  if (directToken && !directToken.startsWith('mock-jwt-token')) {
    return directToken;
  }
  try {
    const authStorage = localStorage.getItem('buildtwin-auth-storage');
    if (authStorage) {
      const parsed = JSON.parse(authStorage);
      const storeToken = parsed.state?.accessToken;
      if (storeToken && !storeToken.startsWith('mock-jwt-token')) {
        return storeToken;
      }
    }
  } catch {
    // ignore json parsing errors
  }
  return directToken;
}

/**
 * Universal Native Fetch Wrapper with JWT Token Auto-Injection
 */
export async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { params, headers, ...restOptions } = options;

  // Build URL with Query Parameters
  let url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes('?') ? '&' : '?') + queryString;
    }
  }

  // Retrieve JWT Auth Token
  const token = getActiveAuthToken();

  const authHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  if (token) {
    authHeaders['Authorization'] = `Bearer ${token}`;
  }

  const mergedHeaders = {
    ...authHeaders,
    ...((headers as Record<string, string>) || {}),
  };

  try {
    const response = await fetch(url, {
      ...restOptions,
      headers: mergedHeaders,
    });

    // Handle 401 Unauthorized (Session Expired)
    if (response.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('buildtwin_token');
        localStorage.removeItem('token');
        console.warn('Session expired. Redirecting to /login');
      }
      throw new Error('Session expired. Please log in again.');
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return null as unknown as T;
    }

    const jsonResult: ApiResponse<T> = await response.json().catch(() => ({
      status: response.status,
      success: response.ok,
      message: response.statusText,
      data: null as unknown as T,
      timestamp: new Date().toISOString(),
    }));

    if (!response.ok || !jsonResult.success) {
      const errorMsg = jsonResult.message || `HTTP ${response.status} Request failed`;
      throw new Error(errorMsg);
    }

    // Standard unwrap: Return payload data directly
    return jsonResult.data;
  } catch (error: any) {
    console.error(`API Fetch Error [${options.method || 'GET'} ${url}]:`, error.message);
    throw error;
  }
}

// Convenience Native HTTP Methods
export const http = {
  get: <T>(endpoint: string, params?: Record<string, any>) =>
    request<T>(endpoint, { method: 'GET', params }),
  post: <T>(endpoint: string, body?: any, params?: Record<string, any>) =>
    request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
      params,
    }),
  put: <T>(endpoint: string, body?: any, params?: Record<string, any>) =>
    request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
      params,
    }),
  patch: <T>(endpoint: string, body?: any, params?: Record<string, any>) =>
    request<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
      params,
    }),
  delete: <T>(endpoint: string, params?: Record<string, any>) =>
    request<T>(endpoint, { method: 'DELETE', params }),
};

// Backward-compatible Axios instance for existing service modules
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getActiveAuthToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => {
    return response.data?.data !== undefined ? response.data.data : response.data;
  },
  (error: AxiosError<ApiResponse<any>>) => {
    const resData = error.response?.data as any;
    const message = resData?.message || error.message || 'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

export { apiClient };
export default apiClient;
