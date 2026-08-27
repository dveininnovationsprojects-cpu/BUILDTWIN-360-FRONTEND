import { apiClient } from '@/lib/apiClient';

// Maps to /documents (spec section 14 - API Requirements).
export const documentsApi = {
  list: (params) =>
    apiClient.get('/documents', { params }).then((r) => r.data),
  getById: (id) => apiClient.get(`/documents/${id}`).then((r) => r.data),
  create: (payload) =>
    apiClient.post('/documents', payload).then((r) => r.data),
  update: (id, payload) =>
    apiClient.put(`/documents/${id}`, payload).then((r) => r.data),
};
