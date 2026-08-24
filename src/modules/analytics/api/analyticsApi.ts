import { apiClient } from '@/lib/apiClient';
import type { ProjectHealth } from '../types';

// Maps to /analytics/project-health (spec section 14 - API Requirements).
export const analyticsApi = {
  list: (params?: Record<string, unknown>) =>
    apiClient.get<ProjectHealth[]>('/analytics/project-health', { params }).then((r) => r.data),
  getById: (id: string) => apiClient.get<ProjectHealth>(`/analytics/project-health/${id}`).then((r) => r.data),
  create: (payload: Partial<ProjectHealth>) =>
    apiClient.post<ProjectHealth>('/analytics/project-health', payload).then((r) => r.data),
  update: (id: string, payload: Partial<ProjectHealth>) =>
    apiClient.put<ProjectHealth>(`/analytics/project-health/${id}`, payload).then((r) => r.data),
};
