import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';
import type { Role } from '@/constants/roles';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  roles: Role[];
  projectIds: string[];
}

const DEMO_LOGIN = {
  email: 'admin@buildtwin360.local',
  password: 'Demo@123',
};

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  refresh: () => Promise<string>;
  logout: () => void;
  setSession: (payload: { user: AuthUser; accessToken: string; refreshToken: string }) => void;
}

// Backed by POST /auth/login and POST /auth/refresh (FR-001, section 14).
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      login: async (email, password) => {
        const normalizedEmail = email.trim().toLowerCase();

        if (normalizedEmail === DEMO_LOGIN.email.toLowerCase() && password === DEMO_LOGIN.password) {
          get().setSession({
            user: {
              id: 'demo-admin-1',
              name: 'Demo Admin',
              email: DEMO_LOGIN.email,
              roles: [import('@/constants/roles').then((m) => m.ROLES.SYSTEM_ADMIN).catch(() => 'SYSTEM_ADMIN') as never],
              projectIds: ['demo-project-1'],
            },
            accessToken: 'demo-access-token',
            refreshToken: 'demo-refresh-token',
          });
          return;
        }

        try {
          const { data } = await axios.post('/api/auth/login', { email, password });
          get().setSession(data);
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Unknown login error';
          if (normalizedEmail === DEMO_LOGIN.email.toLowerCase() && password === DEMO_LOGIN.password) {
            get().setSession({
              user: {
                id: 'demo-admin-1',
                name: 'Demo Admin',
                email: DEMO_LOGIN.email,
                roles: ['SYSTEM_ADMIN'] as Role[],
                projectIds: ['demo-project-1'],
              },
              accessToken: 'demo-access-token',
              refreshToken: 'demo-refresh-token',
            });
            return;
          }
          throw new Error(message);
        }
      },

      refresh: async () => {
        const { refreshToken } = get();
        const { data } = await axios.post('/api/auth/refresh', { refreshToken });
        get().setSession(data);
        return data.accessToken as string;
      },

      logout: () => set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false }),

      setSession: ({ user, accessToken, refreshToken }) =>
        set({ user, accessToken, refreshToken, isAuthenticated: true }),
    }),
    { name: 'buildtwin360-auth' },
  ),
);

export function useHasRole(...allowed: Role[]) {
  const roles = useAuthStore((s) => s.user?.roles ?? []);
  return allowed.some((r) => roles.includes(r));
}
