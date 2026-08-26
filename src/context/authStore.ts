import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';
import { ROLES, type Role } from '@/constants/roles';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  roles: Role[];
  projectIds: string[];
}

export interface DemoAccount {
  email: string;
  password: string;
  name: string;
  role: Role;
}

export const ROLE_LABELS: Record<Role, string> = {
  [ROLES.DIRECTOR]: 'Director / Management',
  [ROLES.PROJECT_MANAGER]: 'Project Manager',
  [ROLES.SITE_ENGINEER]: 'Site Engineer',
  [ROLES.SITE_SUPERVISOR]: 'Site Supervisor',
  [ROLES.PROCUREMENT_STORE]: 'Procurement / Store',
  [ROLES.COST_COORDINATOR]: 'Quantity / Cost Coordinator',
  [ROLES.QUALITY_ENGINEER]: 'Quality Engineer',
  [ROLES.DATA_ANALYST]: 'Data / Management Analyst',
  [ROLES.SYSTEM_ADMIN]: 'System Administrator',
  [ROLES.AUDITOR]: 'Auditor',
};

export const DEMO_ACCOUNTS: DemoAccount[] = [
  { email: 'director@buildtwin360.com', password: 'Director@123', name: 'Director / Management', role: ROLES.DIRECTOR },
  { email: 'manager@buildtwin360.com', password: 'Manager@123', name: 'Project Manager', role: ROLES.PROJECT_MANAGER },
  { email: 'engineer@buildtwin360.com', password: 'Engineer@123', name: 'Site Engineer', role: ROLES.SITE_ENGINEER },
  { email: 'supervisor@buildtwin360.com', password: 'Supervisor@123', name: 'Site Supervisor', role: ROLES.SITE_SUPERVISOR },
  { email: 'procurement@buildtwin360.com', password: 'Procure@123', name: 'Procurement / Store', role: ROLES.PROCUREMENT_STORE },
  { email: 'cost@buildtwin360.com', password: 'Cost@123', name: 'Quantity / Cost Coordinator', role: ROLES.COST_COORDINATOR },
  { email: 'quality@buildtwin360.com', password: 'Quality@123', name: 'Quality Engineer', role: ROLES.QUALITY_ENGINEER },
  { email: 'analyst@buildtwin360.com', password: 'Analyst@123', name: 'Data Analyst', role: ROLES.DATA_ANALYST },
  { email: 'admin@buildtwin360.com', password: 'Demo@123', name: 'System Administrator', role: ROLES.SYSTEM_ADMIN },
  { email: 'auditor@buildtwin360.com', password: 'Auditor@123', name: 'Auditor', role: ROLES.AUDITOR },
];

function normalizeDemoUser(user: AuthUser, accounts: DemoAccount[]) {
  const demoAccount = DEMO_ACCOUNTS.find((account) => account.email === user.email.toLowerCase())
    ?? DEMO_ACCOUNTS.find((account) => account.role === user.roles[0] && (user.id.startsWith('demo-') || user.email.includes('buildtwin360')))
    ?? accounts.find((account) => account.email === user.email.toLowerCase());
  return demoAccount ? { ...user, name: demoAccount.name, email: demoAccount.email, roles: [demoAccount.role] } : user;
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  demoAccounts: DemoAccount[];
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
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
      demoAccounts: DEMO_ACCOUNTS,

      login: async (email, password) => {
        const normalizedEmail = email.trim().toLowerCase();
        const demoAccount = DEMO_ACCOUNTS.find((account) => account.email === normalizedEmail && account.password === password)
          ?? get().demoAccounts.find((account) => account.email === normalizedEmail && account.password === password);

        if (demoAccount) {
          get().setSession({
            user: {
              id: `demo-${demoAccount.role.toLowerCase()}`,
              name: demoAccount.name,
              email: demoAccount.email,
              roles: [demoAccount.role],
              projectIds: ['demo-project-1'],
            },
            accessToken: `demo-${demoAccount.role.toLowerCase()}-access-token`,
            refreshToken: `demo-${demoAccount.role.toLowerCase()}-refresh-token`,
          });
          return;
        }

        try {
          const { data } = await axios.post('/api/auth/login', { email, password });
          get().setSession(data);
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Unknown login error';
          throw new Error(message);
        }
      },

      register: async (name, email, password) => {
        const normalizedEmail = email.trim().toLowerCase();
        if (get().demoAccounts.some((account) => account.email === normalizedEmail)) {
          throw new Error('An account with this email already exists.');
        }
        const account = { email: normalizedEmail, password, name: name.trim(), role: ROLES.SITE_ENGINEER };
        set((state) => ({ demoAccounts: [...state.demoAccounts, account] }));
      },

      refresh: async () => {
        const { refreshToken } = get();
        const { data } = await axios.post('/api/auth/refresh', { refreshToken });
        get().setSession(data);
        return data.accessToken as string;
      },

      logout: () => set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false }),

      setSession: ({ user, accessToken, refreshToken }) => {
        const normalizedUser = normalizeDemoUser(user, get().demoAccounts);
        set({ user: normalizedUser, accessToken, refreshToken, isAuthenticated: true });
      },
    }),
    {
      name: 'buildtwin360-auth',
      onRehydrateStorage: () => (state) => {
        if (state?.user) {
          const normalizedUser = normalizeDemoUser(state.user, state.demoAccounts);
          if (normalizedUser.name !== state.user.name || normalizedUser.roles[0] !== state.user.roles[0]) {
            state.setSession({ user: normalizedUser, accessToken: state.accessToken ?? '', refreshToken: state.refreshToken ?? '' });
          }
        }
      },
    },
  ),
);

export function useHasRole(...allowed: Role[]) {
  const roles = useAuthStore((s) => s.user?.roles ?? []);
  return allowed.some((r) => roles.includes(r));
}
