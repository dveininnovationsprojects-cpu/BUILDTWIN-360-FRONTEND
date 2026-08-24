import { apiClient } from '@/lib/apiClient';
import type { Equipment } from '../types';

// Maps to /equipment (spec section 14 - API Requirements).
export const equipmentApi = {
  list: (params?: Record<string, unknown>) =>
    apiClient.get<Equipment[]>('/equipment', { params }).then((r) => r.data),
  getById: (id: string) => apiClient.get<Equipment>(`/equipment/${id}`).then((r) => r.data),
  create: (payload: Partial<Equipment>) =>
    apiClient.post<Equipment>('/equipment', payload).then((r) => r.data),
  update: (id: string, payload: Partial<Equipment>) =>
    apiClient.put<Equipment>(`/equipment/${id}`, payload).then((r) => r.data),
};
