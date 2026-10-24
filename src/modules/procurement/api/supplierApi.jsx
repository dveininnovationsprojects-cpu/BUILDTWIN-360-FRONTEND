import { apiClient } from '@/lib/apiClient';

function extractList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.items)) return data.items;
  return [];
}

function extractSingle(data) {
  return data?.data && typeof data.data === 'object' && !Array.isArray(data.data) ? data.data : data;
}

export const supplierApi = {
  async list() {
    const response = await apiClient.get('/suppliers');
    return extractList(response.data).map((supplier) => ({ ...supplier, status: supplier.status || 'ACTIVE' }));
  },

  async create(payload) {
    const response = await apiClient.post('/suppliers', payload);
    return extractSingle(response.data);
  },

  async update(id, payload) {
    const response = await apiClient.put(`/suppliers/${id}`, payload);
    return extractSingle(response.data);
  },

  async getById(id) {
    return extractSingle((await apiClient.get(`/suppliers/${id}`)).data);
  },

  async getByCode(code) {
    return extractSingle((await apiClient.get(`/suppliers/code/${encodeURIComponent(code)}`)).data);
  },

  async listByStatus(status) {
    return extractList((await apiClient.get(`/suppliers/status/${encodeURIComponent(status)}`)).data);
  },

  async remove(id) {
    return (await apiClient.delete(`/suppliers/${id}`)).data;
  },
};
