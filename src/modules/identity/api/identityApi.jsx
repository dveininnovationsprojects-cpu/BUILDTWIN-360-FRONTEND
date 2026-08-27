import { apiClient } from '@/lib/apiClient';

// Maps to POST /auth/login, POST /auth/refresh (section 14) and user administration endpoints.
export const identityApi = {
  listUsers: () => apiClient.get('/users').then((r) => r.data),
  createUser: (payload) => apiClient.post('/users', payload).then((r) => r.data),
  setUserStatus: (id, status) =>
    apiClient.patch(`/users/${id}/status`, { status }).then((r) => r.data),
};
