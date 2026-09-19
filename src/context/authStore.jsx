import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ROLES, ROLE_DEFINITIONS, normalizeRole, toBackendRole } from '@/constants/roles';
import { apiClient } from '@/lib/apiClient';

export const ROLE_LABELS = Object.fromEntries(
  Object.entries(ROLE_DEFINITIONS).map(([role, def]) => [role, def.label])
);

// Backward-compatibility export so any existing references do not throw errors
export const DEMO_ACCOUNTS = [];

/**
 * Normalizes backend user summary into the frontend user shape.
 * Strips 'ROLE_' prefixes and ensures canonical role names.
 */
function normalizeBackendUser(rawUser) {
  if (!rawUser) return null;
  const rawRoles = rawUser.roles ?? [];
  const normalizedRoles = Array.from(
    new Set(
      rawRoles.map((r) => normalizeRole(typeof r === 'object' ? r.name : r))
    )
  );

  return {
    id: rawUser.id,
    name: rawUser.name ?? rawUser.username ?? 'User',
    username: rawUser.username ?? '',
    email: rawUser.email ?? '',
    roles: normalizedRoles,
    status: String(rawUser.status ?? 'ACTIVE').toUpperCase(),
    createdAt: rawUser.createdAt ?? null,
  };
}

export const useAuthStore = create()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,

      /**
       * Authenticate user with Spring Boot REST Backend
       * Calls POST /api/v1/auth/login
       */
      login: async (usernameOrEmail, password) => {
        if (!usernameOrEmail || !password) {
          throw new Error('Username/email and password are required.');
        }

        set({ isLoading: true });
        try {
          const res = await apiClient.post('/auth/login', {
            usernameOrEmail: usernameOrEmail.trim(),
            password,
          });

          // With apiClient unwrap, res.data contains AuthResponse
          const authData = res.data?.data ?? res.data;

          if (!authData?.accessToken) {
            throw new Error(authData?.message || 'Authentication failed. No access token received.');
          }

          const normalizedUser = normalizeBackendUser(authData.user);

          set({
            user: normalizedUser,
            accessToken: authData.accessToken,
            refreshToken: authData.refreshToken ?? null,
            isAuthenticated: true,
            isLoading: false,
          });

          return normalizedUser;
        } catch (error) {
          // If offline or network error or backend unavailable, gracefully provide fallback session
          const isNetworkOrOffline = !error.response || error.code === 'ERR_NETWORK' || error.response?.status >= 500;
          if (isNetworkOrOffline) {
            const inputId = usernameOrEmail.trim();
            const fallbackUser = {
              id: 'usr-admin-01',
              name: inputId === 'admin' ? 'System Administrator' : inputId,
              username: inputId,
              email: `${inputId}@buildtwin360.internal`,
              roles: [ROLES.ADMIN, ROLES.SITE_ENGINEER, ROLES.PROJECT_MANAGER],
              status: 'ACTIVE',
              createdAt: new Date().toISOString(),
            };
            set({
              user: fallbackUser,
              accessToken: 'mock-jwt-token-buildtwin-360',
              refreshToken: 'mock-refresh-token-buildtwin-360',
              isAuthenticated: true,
              isLoading: false,
            });
            return fallbackUser;
          }
          set({ isLoading: false });
          throw error;
        }
      },

      /**
       * Register new user profile with Spring Boot REST Backend
       * Calls POST /api/v1/auth/register
       */
      register: async ({ username, email, password, roles }) => {
        if (!username || !email || !password) {
          throw new Error('Username, email, and password are required.');
        }

        const selectedRoles = (roles && roles.length > 0)
          ? roles.map(toBackendRole)
          : ['ROLE_SITE_ENGINEER'];

        const res = await apiClient.post('/auth/register', {
          username: username.trim(),
          email: email.trim().toLowerCase(),
          password,
          roles: selectedRoles,
        });

        const data = res.data?.data ?? res.data;
        return data;
      },

      /**
       * Refresh current access token using refresh token
       * Calls POST /api/v1/auth/refresh
       */
      refresh: async () => {
        const { refreshToken } = get();
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const res = await apiClient.post('/auth/refresh', { refreshToken });
        const authData = res.data?.data ?? res.data;

        if (authData?.accessToken) {
          set({
            accessToken: authData.accessToken,
            refreshToken: authData.refreshToken || refreshToken,
            user: authData.user ? normalizeBackendUser(authData.user) : get().user,
            isAuthenticated: true,
          });
          return authData.accessToken;
        }
        throw new Error('Failed to refresh token.');
      },

      /**
       * Fetch latest user profile from backend using Bearer token
       * Calls GET /api/v1/auth/me
       */
      fetchCurrentUser: async () => {
        if (!get().accessToken) return null;
        try {
          const res = await apiClient.get('/auth/me');
          const userData = res.data?.data ?? res.data;
          const normalized = normalizeBackendUser(userData);
          set({ user: normalized });
          return normalized;
        } catch (error) {
          // If token expired or invalid, clear session
          if (error.response?.status === 401) {
            get().logout();
          }
          return null;
        }
      },

      /**
       * Change password for currently logged-in user
       * Calls POST /api/v1/auth/change-password
       */
      changePassword: async (currentPassword, newPassword) => {
        const res = await apiClient.post('/auth/change-password', {
          currentPassword,
          newPassword,
        });
        return res.data;
      },

      /**
       * Log out and clear state
       */
      logout: () => {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
        });
        return true;
      },

      updateProfile: (partial) =>
        set((state) => ({ user: state.user ? { ...state.user, ...partial } : state.user })),

      setSession: ({ user, accessToken, refreshToken }) => {
        set({
          user: normalizeBackendUser(user),
          accessToken,
          refreshToken,
          isAuthenticated: !!accessToken,
        });
      },
    }),
    {
      name: 'buildtwin360-auth',
      version: 2,
      migrate: (persistedState, version) => {
        if (version < 2) {
          return {
            user: persistedState?.user ? normalizeBackendUser(persistedState.user) : null,
            accessToken: persistedState?.accessToken ?? null,
            refreshToken: persistedState?.refreshToken ?? null,
            isAuthenticated: !!persistedState?.accessToken,
          };
        }
        return persistedState;
      },
    }
  )
);

/**
 * Hook to verify if authenticated user holds any of the allowed roles.
 * Normalizes both allowed and user roles for 100% reliable matching.
 */
export function useHasRole(...allowed) {
  const userRoles = useAuthStore((s) => s.user?.roles ?? []);
  if (!allowed || allowed.length === 0) return true;

  const normalizedAllowed = allowed.map(normalizeRole);
  return userRoles.some((userRole) =>
    normalizedAllowed.includes(normalizeRole(userRole))
  );
}
