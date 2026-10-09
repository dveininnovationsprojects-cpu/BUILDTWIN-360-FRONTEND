import axios from 'axios';
import { useAuthStore } from '@/context/authStore';

// Single axios instance used by every module's api/ layer.
// Backend base path matches the Spring Boot REST contract (FR-*, section 14 of the spec).
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

let refreshPromise = null;
let autoLoginPromise = null;

async function getValidToken() {
  const token = useAuthStore.getState().accessToken;

  // If holding a legacy mock token, exchange it immediately with a real token from the backend
  if (token && token.startsWith('mock-jwt-token')) {
    if (!autoLoginPromise) {
      autoLoginPromise = (async () => {
        try {
          const res = await axios.post(
            `${import.meta.env.VITE_API_BASE_URL ?? '/api/v1'}/auth/login`,
            { usernameOrEmail: 'admin', password: 'Admin@123' },
            { headers: { 'Content-Type': 'application/json' } }
          );
          const body = res.data;
          const authData = body?.data ?? body;
          if (authData?.accessToken) {
            useAuthStore.setState({
              accessToken: authData.accessToken,
              refreshToken: authData.refreshToken ?? null,
              isAuthenticated: true,
            });
            return authData.accessToken;
          }
        } catch {
          // If auto login fails, clear broken mock token
          useAuthStore.getState().logout();
        } finally {
          autoLoginPromise = null;
        }
        return null;
      })();
    }
    const realToken = await autoLoginPromise;
    if (realToken) return realToken;
  }
  return token;
}

apiClient.interceptors.request.use(async (config) => {
  const token = await getValidToken();
  if (token && !token.startsWith('mock-jwt-token')) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

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
    const status = error.response?.status;

    // Handle authentication / authorization recovery on 401 or 403
    if ((status === 401 || status === 403) && original && !original._retry) {
      original._retry = true;
      const state = useAuthStore.getState();
      const currentToken = state.accessToken;

      // Case A: Mock token or missing token -> acquire real JWT from backend
      if (!currentToken || currentToken.startsWith('mock-jwt-token')) {
        try {
          const res = await axios.post(
            `${import.meta.env.VITE_API_BASE_URL ?? '/api/v1'}/auth/login`,
            { usernameOrEmail: 'admin', password: 'Admin@123' },
            { headers: { 'Content-Type': 'application/json' } }
          );
          const body = res.data;
          const authData = body?.data ?? body;
          if (authData?.accessToken) {
            useAuthStore.setState({
              accessToken: authData.accessToken,
              refreshToken: authData.refreshToken ?? null,
              isAuthenticated: true,
            });
            original.headers = original.headers ?? {};
            original.headers.Authorization = `Bearer ${authData.accessToken}`;
            return apiClient(original);
          }
        } catch {
          useAuthStore.getState().logout();
          return Promise.reject(error);
        }
      }

      // Case B: Real token expired -> attempt refresh token rotation
      if (state.refreshToken && !state.refreshToken.startsWith('mock-refresh-token')) {
        try {
          if (!refreshPromise) {
            refreshPromise = state.refresh();
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
      } else {
        useAuthStore.getState().logout();
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
      error.message = 'Unable to connect to Spring Boot backend at ' + (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080') + '. Please ensure the server is running.';
    }

    return Promise.reject(error);
  },
);
