import { apiClient } from '@/lib/apiClient';
import type { AppUser } from '../types';

// Maps to POST /auth/login, POST /auth/refresh (section 14) and user administration endpoints.
export const identityApi = {
  listUsers: () => apiClient.get<AppUser[]>('/users').then((r) => r.data),
  createUser: (payload: Partial<AppUser>) => apiClient.post<AppUser>('/users', payload).then((r) => r.data),
  setUserStatus: (id: string, status: AppUser['status']) =>
    apiClient.patch<AppUser>(`/users/${id}/status`, { status }).then((r) => r.data),
};
