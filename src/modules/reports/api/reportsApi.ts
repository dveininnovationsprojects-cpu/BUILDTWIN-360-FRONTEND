import { apiClient } from '@/lib/apiClient';
import type { Report } from '../types';

// Maps to /reports (spec section 14 - API Requirements).
export const reportsApi = {
  list: (params?: Record<string, unknown>) =>
    apiClient.get<Report[]>('/reports', { params }).then((r) => r.data),
  getById: (id: string) => apiClient.get<Report>(`/reports/${id}`).then((r) => r.data),
  create: (payload: Partial<Report>) =>
    apiClient.post<Report>('/reports', payload).then((r) => r.data),
  update: (id: string, payload: Partial<Report>) =>
    apiClient.put<Report>(`/reports/${id}`, payload).then((r) => r.data),
};
