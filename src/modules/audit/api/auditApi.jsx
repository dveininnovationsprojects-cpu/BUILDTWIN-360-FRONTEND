import { apiClient } from '@/lib/apiClient';

// Maps to /audit-logs (spec section 14 - API Requirements).
export const auditApi = {
  list: (params) =>
    apiClient.get('/audit-logs', { params }).then((r) => r.data),
  getById: (id) => apiClient.get(`/audit-logs/${id}`).then((r) => r.data),
  create: (payload) =>
    apiClient.post('/audit-logs', payload).then((r) => r.data),
  update: (id, payload) =>
    apiClient.put(`/audit-logs/${id}`, payload).then((r) => r.data),
};
