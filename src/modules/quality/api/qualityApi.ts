import { apiClient } from '@/lib/apiClient';
import type { QualityIssue } from '../types';

// Maps to /quality-issues (spec section 14 - API Requirements).
export const qualityApi = {
  list: (params?: Record<string, unknown>) =>
    apiClient.get<QualityIssue[]>('/quality-issues', { params }).then((r) => r.data),
  getById: (id: string) => apiClient.get<QualityIssue>(`/quality-issues/${id}`).then((r) => r.data),
  create: (payload: Partial<QualityIssue>) =>
    apiClient.post<QualityIssue>('/quality-issues', payload).then((r) => r.data),
  update: (id: string, payload: Partial<QualityIssue>) =>
    apiClient.put<QualityIssue>(`/quality-issues/${id}`, payload).then((r) => r.data),
};
