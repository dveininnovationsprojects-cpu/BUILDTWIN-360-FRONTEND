import { apiClient } from '@/lib/apiClient';

// Maps to /dpr (spec section 14 - API Requirements).
export const progressDprApi = {
  list: (params) =>
    apiClient.get('/dpr', { params }).then((r) => r.data),
  getById: (id) => apiClient.get(`/dpr/${id}`).then((r) => r.data),
  create: (payload) =>
    apiClient.post('/dpr', payload).then((r) => r.data),
  update: (id, payload) =>
    apiClient.put(`/dpr/${id}`, payload).then((r) => r.data),
};
