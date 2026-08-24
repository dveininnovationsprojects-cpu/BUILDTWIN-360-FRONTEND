import { apiClient } from '@/lib/apiClient';
import type { Material } from '../types';

// Maps to /materials (spec section 14 - API Requirements).
export const materialsInventoryApi = {
  list: (params?: Record<string, unknown>) =>
    apiClient.get<Material[]>('/materials', { params }).then((r) => r.data),
  getById: (id: string) => apiClient.get<Material>(`/materials/${id}`).then((r) => r.data),
  create: (payload: Partial<Material>) =>
    apiClient.post<Material>('/materials', payload).then((r) => r.data),
  update: (id: string, payload: Partial<Material>) =>
    apiClient.put<Material>(`/materials/${id}`, payload).then((r) => r.data),
};
