import { apiClient } from '@/lib/apiClient';

// Maps to /activities (spec section 14 - API Requirements).
export const wbsScheduleApi = {
  list: (params) =>
    apiClient.get('/activities', { params }).then((r) => r.data),
  getById: (id) => apiClient.get(`/activities/${id}`).then((r) => r.data),
  create: (payload) =>
    apiClient.post('/activities', payload).then((r) => r.data),
  update: (id, payload) =>
    apiClient.put(`/activities/${id}`, payload).then((r) => r.data),
};
