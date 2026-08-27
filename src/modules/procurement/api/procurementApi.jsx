import { apiClient } from '@/lib/apiClient';

// Maps to /purchase-orders (spec section 14 - API Requirements).
export const procurementApi = {
  list: (params) =>
    apiClient.get('/purchase-orders', { params }).then((r) => r.data),
  getById: (id) => apiClient.get(`/purchase-orders/${id}`).then((r) => r.data),
  create: (payload) =>
    apiClient.post('/purchase-orders', payload).then((r) => r.data),
  update: (id, payload) =>
    apiClient.put(`/purchase-orders/${id}`, payload).then((r) => r.data),
};
