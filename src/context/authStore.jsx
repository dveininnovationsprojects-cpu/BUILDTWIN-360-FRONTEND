import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ROLES } from '@/constants/roles';
import { apiClient } from '@/lib/apiClient';

export const ROLE_LABELS = {
  [ROLES.DIRECTOR]: 'Director / Management',
  [ROLES.PROJECT_MANAGER]: 'Project Manager',
  [ROLES.SITE_ENGINEER]: 'Site Engineer',
  [ROLES.SITE_SUPERVISOR]: 'Site Supervisor',
  [ROLES.PROCUREMENT_STORE]: 'Procurement / Store',
  [ROLES.COST_COORDINATOR]: 'Quantity / Cost Coordinator',
  [ROLES.QUALITY_ENGINEER]: 'Quality Engineer',
  [ROLES.DATA_ANALYST]: 'Data / Management Analyst',
  [ROLES.SYSTEM_ADMIN]: 'System Administrator',
  [ROLES.AUDITOR]: 'Auditor / Reviewer',
};

export const DEMO_ACCOUNTS = [
  { id: 'demo-director', email: 'director@buildtwin360.com', password: 'Director@123', name: 'Director / Management', role: ROLES.DIRECTOR, status: 'active' },
  { id: 'demo-project_manager', email: 'manager@buildtwin360.com', password: 'Manager@123', name: 'Project Manager', role: ROLES.PROJECT_MANAGER, status: 'active' },
  { id: 'demo-site_engineer', email: 'engineer@buildtwin360.com', password: 'Engineer@123', name: 'Site Engineer', role: ROLES.SITE_ENGINEER, status: 'active' },
  { id: 'demo-site_supervisor', email: 'supervisor@buildtwin360.com', password: 'Supervisor@123', name: 'Site Supervisor', role: ROLES.SITE_SUPERVISOR, status: 'active' },
  { id: 'demo-procurement_store', email: 'procurement@buildtwin360.com', password: 'Procure@123', name: 'Procurement / Store', role: ROLES.PROCUREMENT_STORE, status: 'active' },
  { id: 'demo-cost_coordinator', email: 'cost@buildtwin360.com', password: 'Cost@123', name: 'Quantity / Cost Coordinator', role: ROLES.COST_COORDINATOR, status: 'active' },
  { id: 'demo-quality_engineer', email: 'quality@buildtwin360.com', password: 'Quality@123', name: 'Quality Engineer', role: ROLES.QUALITY_ENGINEER, status: 'active' },
  { id: 'demo-data_analyst', email: 'analyst@buildtwin360.com', password: 'Analyst@123', name: 'Data Analyst', role: ROLES.DATA_ANALYST, status: 'active' },
  { id: 'demo-system_admin', email: 'admin@buildtwin360.com', password: 'Demo@123', name: 'System Administrator', role: ROLES.SYSTEM_ADMIN, status: 'active' },
  { id: 'demo-auditor', email: 'auditor@buildtwin360.com', password: 'Auditor@123', name: 'Auditor', role: ROLES.AUDITOR, status: 'active' },
];

const toUserRecord = (account) => ({
  id: account.id,
  name: account.name,
  email: account.email,
  roles: [account.role],
  status: account.status ?? 'active',
});

function normalizeDemoUser(user, accounts) {
  const demoAccount = DEMO_ACCOUNTS.find((account) => account.email === user.email.toLowerCase())
    ?? DEMO_ACCOUNTS.find((account) => account.role === user.roles[0] && (user.id.startsWith('demo-') || user.email.includes('buildtwin360')))
    ?? accounts.find((account) => account.email === user.email.toLowerCase());
  return demoAccount ? { ...user, name: demoAccount.name, email: demoAccount.email, roles: [demoAccount.role] } : user;
}

// Backed by POST /auth/login and POST /auth/refresh (FR-001, section 14).
export const useAuthStore = create()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      demoAccounts: DEMO_ACCOUNTS,

      login: async (email, password) => {
        // Validate input
        if (!email || !password) {
          throw new Error('Email and password are required.');
        }

        const normalizedEmail = email.trim().toLowerCase();
        
        // Check demo accounts first (local/demo mode)
        const demoAccount = get().demoAccounts.find(
          (account) => account.email === normalizedEmail && account.password === password
        ) ?? DEMO_ACCOUNTS.find(
          (account) => account.email === normalizedEmail && account.password === password
        );

        if (demoAccount) {
          if (demoAccount.status === 'inactive') {
            throw new Error('This account has been deactivated. Contact an administrator.');
          }
          get().setSession({
            user: {
              id: demoAccount.id,
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

        // Try backend API if no demo account found
        try {
          const { data } = await apiClient.post('/auth/login', { email: normalizedEmail, password });
          
          if (!data || !data.user || !data.accessToken) {
            throw new Error('Invalid login response from server.');
          }
          
          get().setSession(data);
        } catch (error) {
          // Extract meaningful error message from axios error
          let errorMessage = 'Invalid email or password.';
          
          if (error instanceof Error) {
            // Handle axios error
            if (error.response?.data?.message) {
              errorMessage = error.response.data.message;
            } else if (error.response?.data?.error) {
              errorMessage = error.response.data.error;
            } else if (error.message && error.message !== 'Invalid login response from server.') {
              errorMessage = error.message;
            } else if (error.message === 'Invalid login response from server.') {
              errorMessage = error.message;
            }
          }
          
          throw new Error(errorMessage);
        }
      },

      register: async (name, email, password) => {
        get().createDemoUser({ name, email, password, role: ROLES.SITE_ENGINEER });
      },

      // Local/demo-mode backing for Settings > User Management (FR-002) —
      // used by identityApi as a fallback when no backend is reachable, so
      // create/activate/deactivate/reset keep working the same way login
      // and register already do without one.
      listDemoUsers: () => get().demoAccounts.map(toUserRecord),

      createDemoUser: ({ name, email, password, role }) => {
        const normalizedEmail = email.trim().toLowerCase();
        if (get().demoAccounts.some((account) => account.email === normalizedEmail)) {
          throw new Error('An account with this email already exists.');
        }
        const account = {
          id: crypto.randomUUID(),
          email: normalizedEmail,
          password,
          name: name.trim(),
          role,
          status: 'active',
        };
        set((state) => ({ demoAccounts: [...state.demoAccounts, account] }));
        return toUserRecord(account);
      },

      setDemoUserStatus: (id, status) => {
        set((state) => ({
          demoAccounts: state.demoAccounts.map((account) => (account.id === id ? { ...account, status } : account)),
        }));
        const account = get().demoAccounts.find((a) => a.id === id);
        if (!account) throw new Error('User not found.');
        return toUserRecord(account);
      },

      resetDemoUserPassword: (id, password) => {
        if (!get().demoAccounts.some((a) => a.id === id)) throw new Error('User not found.');
        set((state) => ({
          demoAccounts: state.demoAccounts.map((account) => (account.id === id ? { ...account, password } : account)),
        }));
        const account = get().demoAccounts.find((a) => a.id === id);
        return toUserRecord(account);
      },

      refresh: async () => {
        const { refreshToken } = get();
        const { data } = await apiClient.post('/auth/refresh', { refreshToken });
        get().setSession(data);
        return data.accessToken;
      },

      logout: async () => {
        // Clear the session state first
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
        // Return a flag to indicate logout was successful
        return true;
      },

      updateProfile: (partial) => set((state) => ({ user: state.user ? { ...state.user, ...partial } : state.user })),

      setSession: ({ user, accessToken, refreshToken }) => {
        const normalizedUser = normalizeDemoUser(user, get().demoAccounts);
        set({ user: normalizedUser, accessToken, refreshToken, isAuthenticated: true });
      },
    }),
    {
      name: 'buildtwin360-auth',
      // v1: demoAccounts entries gained `id`/`status` for Settings > User
      // Management. Browsers with a pre-v1 persisted session would
      // otherwise rehydrate accounts missing both, colliding on
      // `id: undefined` in the users table and in status/reset lookups.
      version: 1,
      migrate: (persistedState, version) => {
        if (version < 1 && persistedState?.demoAccounts) {
          persistedState.demoAccounts = persistedState.demoAccounts.map((account) => ({
            ...account,
            id: account.id ?? DEMO_ACCOUNTS.find((seed) => seed.email === account.email)?.id ?? crypto.randomUUID(),
            status: account.status ?? 'active',
          }));
        }
        return persistedState;
      },
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

export function useHasRole(...allowed) {
  const roles = useAuthStore((s) => s.user?.roles ?? []);
  return allowed.some((r) => roles.includes(r));
}
