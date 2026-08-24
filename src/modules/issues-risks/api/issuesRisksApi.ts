import { apiClient } from '@/lib/apiClient';
import type { Issue } from '../types';

// Maps to /issues (spec section 14 - API Requirements).
export const issuesRisksApi = {
  list: (params?: Record<string, unknown>) =>
    apiClient.get<Issue[]>('/issues', { params }).then((r) => r.data),
  getById: (id: string) => apiClient.get<Issue>(`/issues/${id}`).then((r) => r.data),
  create: (payload: Partial<Issue>) =>
    apiClient.post<Issue>('/issues', payload).then((r) => r.data),
  update: (id: string, payload: Partial<Issue>) =>
    apiClient.put<Issue>(`/issues/${id}`, payload).then((r) => r.data),
};
