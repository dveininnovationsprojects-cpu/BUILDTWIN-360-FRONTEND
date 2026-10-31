import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ROLES, ROLE_DEFINITIONS, normalizeRole, toBackendRole } from '@/constants/roles';
import { apiClient } from '@/lib/apiClient';

export const ROLE_LABELS = Object.fromEntries(
  Object.entries(ROLE_DEFINITIONS).map(([role, def]) => [role, def.label])
);

// Master Demo Accounts for all 10 domain roles (SRS Section 7)
export const DEMO_ACCOUNTS = [
  { role: ROLES.DIRECTOR, username: 'director', name: 'Rajesh Sharma', email: 'director@buildtwin360.com', password: 'Password@123' },
  { role: ROLES.PROJECT_MANAGER, username: 'pm', name: 'Priya Sundaram', email: 'pm@buildtwin360.com', password: 'Password@123' },
  { role: ROLES.SITE_ENGINEER, username: 'site_engineer', name: 'Karthik Raja', email: 'engineer@buildtwin360.com', password: 'Password@123' },
  { role: ROLES.SITE_SUPERVISOR, username: 'supervisor', name: 'Murugan V', email: 'supervisor@buildtwin360.com', password: 'Password@123' },
  { role: ROLES.PROCUREMENT_STORE, username: 'procurement', name: 'Suresh Kumar', email: 'procurement@buildtwin360.com', password: 'Password@123' },
  { role: ROLES.QUANTITY_COST_COORDINATOR, username: 'cost_coordinator', name: 'Anitha Ramesh', email: 'cost@buildtwin360.com', password: 'Password@123' },
  { role: ROLES.QUALITY_ENGINEER, username: 'quality', name: 'Venkatesh S', email: 'quality@buildtwin360.com', password: 'Password@123' },
  { role: ROLES.DATA_ANALYST, username: 'analyst', name: 'Deepa Nair', email: 'analyst@buildtwin360.com', password: 'Password@123' },
  { role: ROLES.ADMIN, username: 'admin', name: 'System Administrator', email: 'admin@buildtwin360.com', password: 'Admin@123' },
  { role: ROLES.AUDITOR, username: 'auditor', name: 'Ramanathan G', email: 'auditor@buildtwin360.com', password: 'Password@123' },
];

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
       * Quick-login directly into any of the 10 domain roles for dashboard testing
       */
      loginAsRole: (targetRole) => {
        const canonical = normalizeRole(targetRole) || ROLES.DIRECTOR;
        const matched = DEMO_ACCOUNTS.find((a) => normalizeRole(a.role) === canonical);
        const demoUser = {
          id: matched?.username || `demo-${canonical.toLowerCase()}`,
          name: matched?.name || ROLE_DEFINITIONS[canonical]?.label || 'Demo User',
          username: matched?.username || canonical.toLowerCase(),
          email: matched?.email || `${canonical.toLowerCase()}@buildtwin360.com`,
          roles: [canonical],
          status: 'ACTIVE',
          createdAt: new Date().toISOString(),
        };
        const mockToken = `mock-jwt-token-${canonical.toLowerCase()}`;
        set({
          user: demoUser,
          accessToken: mockToken,
          refreshToken: mockToken,
          isAuthenticated: true,
          isLoading: false,
        });
        return demoUser;
      },

      /**
       * Authenticate user with Spring Boot REST Backend
       * Calls POST /api/v1/auth/login with demo account fallback
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

          localStorage.setItem('buildtwin_token', authData.accessToken);
          localStorage.setItem('token', authData.accessToken);

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
          // If backend auth fails, check if input matches any of our 10 demo accounts
          const trimmedInput = usernameOrEmail.trim().toLowerCase();
          const matchDemo = DEMO_ACCOUNTS.find(
            (d) =>
              d.username.toLowerCase() === trimmedInput ||
              d.email.toLowerCase() === trimmedInput ||
              normalizeRole(d.role).toLowerCase() === trimmedInput
          );

          if (matchDemo) {
            const demoUser = get().loginAsRole(matchDemo.role);
            return demoUser;
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
        if (!refreshToken || refreshToken.startsWith('mock-refresh-token')) {
          throw new Error('No valid refresh token available');
        }

        const res = await apiClient.post('/auth/refresh', { refreshToken });
        const authData = res.data?.data ?? res.data;

        if (authData?.accessToken) {
          localStorage.setItem('buildtwin_token', authData.accessToken);
          localStorage.setItem('token', authData.accessToken);
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
          // If token expired, invalid, or forbidden, clear broken session
          if (error.response?.status === 401 || error.response?.status === 403) {
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
        localStorage.removeItem('buildtwin_token');
        localStorage.removeItem('token');
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
        if (accessToken) {
          localStorage.setItem('buildtwin_token', accessToken);
          localStorage.setItem('token', accessToken);
        } else {
          localStorage.removeItem('buildtwin_token');
          localStorage.removeItem('token');
        }
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
