import { apiClient } from '@/lib/apiClient';
import type { DprHeader } from '../types';

// Maps to /dpr (spec section 14 - API Requirements).
export const progressDprApi = {
  list: (params?: Record<string, unknown>) =>
    apiClient.get<DprHeader[]>('/dpr', { params }).then((r) => r.data),
  getById: (id: string) => apiClient.get<DprHeader>(`/dpr/${id}`).then((r) => r.data),
  create: (payload: Partial<DprHeader>) =>
    apiClient.post<DprHeader>('/dpr', payload).then((r) => r.data),
  update: (id: string, payload: Partial<DprHeader>) =>
    apiClient.put<DprHeader>(`/dpr/${id}`, payload).then((r) => r.data),
};
