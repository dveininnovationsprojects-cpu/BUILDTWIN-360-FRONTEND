import { apiClient } from '@/lib/apiClient';
import type { LabourDaily } from '../types';

// Maps to /labour/daily (spec section 14 - API Requirements).
export const labourContractorsApi = {
  list: (params?: Record<string, unknown>) =>
    apiClient.get<LabourDaily[]>('/labour/daily', { params }).then((r) => r.data),
  getById: (id: string) => apiClient.get<LabourDaily>(`/labour/daily/${id}`).then((r) => r.data),
  create: (payload: Partial<LabourDaily>) =>
    apiClient.post<LabourDaily>('/labour/daily', payload).then((r) => r.data),
  update: (id: string, payload: Partial<LabourDaily>) =>
    apiClient.put<LabourDaily>(`/labour/daily/${id}`, payload).then((r) => r.data),
};
