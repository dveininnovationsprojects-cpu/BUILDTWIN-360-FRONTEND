import { apiClient } from '@/lib/apiClient';

// Maps to /notifications (spec section 14 - API Requirements).
export const notificationsApi = {
  list: (params) =>
    apiClient.get('/notifications', { params }).then((r) => r.data),
  getById: (id) => apiClient.get(`/notifications/${id}`).then((r) => r.data),
  create: (payload) =>
    apiClient.post('/notifications', payload).then((r) => r.data),
  update: (id, payload) =>
    apiClient.put(`/notifications/${id}`, payload).then((r) => r.data),
};
