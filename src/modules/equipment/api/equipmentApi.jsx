import { apiClient } from '@/lib/apiClient';

// Maps to /equipment (spec section 14 - API Requirements).
export const equipmentApi = {
  list: (params) =>
    apiClient.get('/equipment', { params }).then((r) => r.data),
  getById: (id) => apiClient.get(`/equipment/${id}`).then((r) => r.data),
  create: (payload) =>
    apiClient.post('/equipment', payload).then((r) => r.data),
  update: (id, payload) =>
    apiClient.put(`/equipment/${id}`, payload).then((r) => r.data),
};
