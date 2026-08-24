import { apiClient } from '@/lib/apiClient';
import type { Project } from '../types';

// Maps to /projects (spec section 14 - API Requirements).
export const projectsApi = {
  list: (params?: Record<string, unknown>) =>
    apiClient.get<Project[]>('/projects', { params }).then((r) => r.data),
  getById: (id: string) => apiClient.get<Project>(`/projects/${id}`).then((r) => r.data),
  create: (payload: Partial<Project>) =>
    apiClient.post<Project>('/projects', payload).then((r) => r.data),
  update: (id: string, payload: Partial<Project>) =>
    apiClient.put<Project>(`/projects/${id}`, payload).then((r) => r.data),
};
