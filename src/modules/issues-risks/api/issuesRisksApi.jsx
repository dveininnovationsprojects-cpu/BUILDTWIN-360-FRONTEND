import { apiClient } from '@/lib/apiClient';

// Maps to /issues (spec section 14 - API Requirements).
export const issuesRisksApi = {
  list: (params) =>
    apiClient.get('/issues', { params }).then((r) => r.data),
  getById: (id) => apiClient.get(`/issues/${id}`).then((r) => r.data),
  create: (payload) =>
    apiClient.post('/issues', payload).then((r) => r.data),
  update: (id, payload) =>
    apiClient.put(`/issues/${id}`, payload).then((r) => r.data),
};
