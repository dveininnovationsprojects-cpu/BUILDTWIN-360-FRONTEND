import { apiClient } from '@/lib/apiClient';

// Maps to /materials (spec section 14 - API Requirements).
export const materialsInventoryApi = {
  list: (params) =>
    apiClient.get('/materials', { params }).then((r) => r.data),
  getById: (id) => apiClient.get(`/materials/${id}`).then((r) => r.data),
  create: (payload) =>
    apiClient.post('/materials', payload).then((r) => r.data),
  update: (id, payload) =>
    apiClient.put(`/materials/${id}`, payload).then((r) => r.data),
};
