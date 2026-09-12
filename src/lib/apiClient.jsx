import axios from 'axios';
import { useAuthStore } from '@/context/authStore';

// Single axios instance used by every module's api/ layer.
// Backend base path matches the Spring Boot REST contract (FR-*, section 14 of the spec).
export const apiClient = axios.create({
  // Spring Boot exposes the REST contract under /api/v1. Keeping this in one
  // client prevents individual modules from drifting onto legacy /api paths.
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshPromise = null;

apiClient.interceptors.response.use(
  (response) => {
    // All backend controllers return ApiResponse<T>. Unwrap it once here so
    // every feature module works with the same entity shape as its UI.
    const body = response.data;
    if (body && body.success === true && Object.prototype.hasOwnProperty.call(body, 'data')) {
      response.data = body.data;
    }
    return response;
  },
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && original && !original._retry && useAuthStore.getState().refreshToken) {
      original._retry = true;
      try {
        if (!refreshPromise) {
          refreshPromise = useAuthStore.getState().refresh();
        }
        const newToken = await refreshPromise;
        original.headers = original.headers ?? {};
        original.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(original);
      } catch (refreshError) {
        useAuthStore.getState().logout();
        return Promise.reject(refreshError);
      } finally {
        refreshPromise = null;
      }
    }

    // Extract clear, human-readable error messages from Spring Boot ErrorResponse
    if (error.response?.data) {
      const { message, error: errType, validationErrors } = error.response.data;
      if (validationErrors && Object.keys(validationErrors).length > 0) {
        const firstValidationKey = Object.keys(validationErrors)[0];
        error.message = `${validationErrors[firstValidationKey]} (${firstValidationKey})`;
      } else if (message) {
        error.message = message;
      } else if (errType) {
        error.message = String(errType);
      }
    } else if (error.code === 'ERR_NETWORK') {
      error.message = 'Unable to connect to Spring Boot backend at ' + (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000') + '. Please ensure the server is running in IntelliJ.';
    }

    return Promise.reject(error);
  },
);
