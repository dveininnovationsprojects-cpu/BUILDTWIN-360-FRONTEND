import { apiClient } from '@/lib/apiClient';

// Maps to /budgets (spec section 14 - API Requirements).
export const costControlApi = {
  list: (params) =>
    apiClient.get('/budgets', { params }).then((r) => r.data),
  getById: (id) => apiClient.get(`/budgets/${id}`).then((r) => r.data),
  create: (payload) =>
    apiClient.post('/budgets', payload).then((r) => r.data),
  update: (id, payload) =>
    apiClient.put(`/budgets/${id}`, payload).then((r) => r.data),
};
