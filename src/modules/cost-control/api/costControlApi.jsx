import { apiClient } from '@/lib/apiClient';

function unwrap(response) {
  const body = response?.data;
  return body?.data !== undefined ? body.data : body;
}

// Backend CostController budget-head endpoints.
export const costControlApi = {
  list: async (projectId) => {
    const response = await apiClient.get(`/cost/budgets/project/${projectId}`);
    const data = unwrap(response);
    return Array.isArray(data) ? data : [];
  },
  getById: async (id) => unwrap(await apiClient.get(`/cost/budgets/${id}`)),
  create: async (payload) => unwrap(await apiClient.post('/cost/budgets', payload)),
  update: async (id, payload) => unwrap(await apiClient.put(`/cost/budgets/${id}`, payload)),
  delete: async (id) => {
    await apiClient.delete(`/cost/budgets/${id}`);
    return true;
  },
};

export const costTransactionApi = {
  list: async (projectId) => {
    const response = await apiClient.get(`/cost/transactions/project/${projectId}`);
    const data = unwrap(response);
    return Array.isArray(data) ? data : [];
  },
  create: async (payload) => unwrap(await apiClient.post('/cost/transactions', payload)),
  delete: async (id) => {
    await apiClient.delete(`/cost/transactions/${id}`);
    return true;
  },
};

export const costAnalyticsApi = {
  evm: async (projectId) => unwrap(await apiClient.get(`/cost/evm/project/${projectId}`)),
};
