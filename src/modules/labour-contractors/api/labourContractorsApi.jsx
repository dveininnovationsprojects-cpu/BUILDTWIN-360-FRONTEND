import { apiClient } from '@/lib/apiClient';

// Maps to /labour/daily (spec section 14 - API Requirements).
export const labourContractorsApi = {
  list: (params) =>
    apiClient.get('/labour/daily', { params }).then((r) => r.data),
  getById: (id) => apiClient.get(`/labour/daily/${id}`).then((r) => r.data),
  create: (payload) =>
    apiClient.post('/labour/daily', payload).then((r) => r.data),
  update: (id, payload) =>
    apiClient.put(`/labour/daily/${id}`, payload).then((r) => r.data),
};
