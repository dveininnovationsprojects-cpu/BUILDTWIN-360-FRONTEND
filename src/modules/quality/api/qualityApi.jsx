import { apiClient } from '@/lib/apiClient';

// Maps to /quality-issues (spec section 14 - API Requirements).
export const qualityApi = {
  list: (params) =>
    apiClient.get('/quality-issues', { params }).then((r) => r.data),
  getById: (id) => apiClient.get(`/quality-issues/${id}`).then((r) => r.data),
  create: (payload) =>
    apiClient.post('/quality-issues', payload).then((r) => r.data),
  update: (id, payload) =>
    apiClient.put(`/quality-issues/${id}`, payload).then((r) => r.data),
};
