import { apiClient } from '@/lib/apiClient';

// Maps to /projects (spec section 14 - API Requirements).
export const projectsApi = {
  list: (params) =>
    apiClient.get('/projects', { params }).then((r) => r.data),
  getById: (id) => apiClient.get(`/projects/${id}`).then((r) => r.data),
  create: (payload) =>
    apiClient.post('/projects', payload).then((r) => r.data),
  update: (id, payload) =>
    apiClient.put(`/projects/${id}`, payload).then((r) => r.data),
};
