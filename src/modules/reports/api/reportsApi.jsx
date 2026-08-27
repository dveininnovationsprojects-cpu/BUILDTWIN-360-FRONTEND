import { apiClient } from '@/lib/apiClient';

// Maps to /reports (spec section 14 - API Requirements).
export const reportsApi = {
  list: (params) =>
    apiClient.get('/reports', { params }).then((r) => r.data),
  getById: (id) => apiClient.get(`/reports/${id}`).then((r) => r.data),
  create: (payload) =>
    apiClient.post('/reports', payload).then((r) => r.data),
  update: (id, payload) =>
    apiClient.put(`/reports/${id}`, payload).then((r) => r.data),
};
