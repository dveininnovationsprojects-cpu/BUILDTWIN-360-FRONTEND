import { apiClient } from '@/lib/apiClient';

// Maps to /analytics/project-health (spec section 14 - API Requirements).
export const analyticsApi = {
  list: (params) =>
    apiClient.get('/analytics/project-health', { params }).then((r) => r.data),
  getById: (id) => apiClient.get(`/analytics/project-health/${id}`).then((r) => r.data),
  create: (payload) =>
    apiClient.post('/analytics/project-health', payload).then((r) => r.data),
  update: (id, payload) =>
    apiClient.put(`/analytics/project-health/${id}`, payload).then((r) => r.data),
};
