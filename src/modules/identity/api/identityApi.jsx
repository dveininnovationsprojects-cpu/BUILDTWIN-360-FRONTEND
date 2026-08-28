 import { apiClient } from '@/lib/apiClient';
import { useAuthStore } from '@/context/authStore';

// Maps to POST /auth/login, POST /auth/refresh (section 14) and user administration endpoints.
//
// Each call falls back to the local demo-account store (authStore) when the
// backend at VITE_API_BASE_URL isn't reachable, the same way login/register
// already work without one — so Settings > User Management stays usable in
// local/demo mode instead of surfacing a raw "Request failed with status
// code 500". Once a real backend is live this fallback only triggers on
// its actual failures.
export const identityApi = {
  listUsers: () =>
    apiClient.get('/users').then((r) => r.data)
      .catch(() => useAuthStore.getState().listDemoUsers()),

  createUser: (payload) =>
    apiClient.post('/users', payload).then((r) => r.data)
      .catch(() => useAuthStore.getState().createDemoUser({
        name: payload.name,
        email: payload.email,
        password: payload.password,
        role: payload.roles?.[0] ?? payload.role,
      })),

  setUserStatus: (id, status) =>
    apiClient.patch(`/users/${id}/status`, { status }).then((r) => r.data)
      .catch(() => useAuthStore.getState().setDemoUserStatus(id, status)),

  // Admin sets the new password directly (FR-002) — no email link, matches
  // how a temporary password is set when the account is first created.
  resetPassword: (id, password) =>
    apiClient.post(`/users/${id}/reset-password`, { password }).then((r) => r.data)
      .catch(() => useAuthStore.getState().resetDemoUserPassword(id, password)),
};
