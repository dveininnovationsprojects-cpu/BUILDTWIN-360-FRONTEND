import { apiClient } from '@/lib/apiClient';

function unwrap(response) {
  const body = response?.data;
  return body?.data !== undefined ? body.data : body;
}

function unwrapList(response) {
  const data = unwrap(response);
  return Array.isArray(data) ? data : [];
}

// Backend CostController budget-head endpoints (FR-070, FR-071)
export const costControlApi = {
  list: async (projectId = 1) => {
    const response = await apiClient.get(`/costs/budgets/project/${projectId}`);
    return unwrapList(response);
  },
  getById: async (id) => unwrap(await apiClient.get(`/costs/budgets/${id}`)),
  create: async (payload) => {
    const baseline = Number(payload.baselineAmount ?? payload.allocatedAmount ?? 0);
    return unwrap(
      await apiClient.post('/costs/budgets', {
        ...payload,
        projectId: Number(payload.projectId),
        baselineAmount: baseline,
        allocatedAmount: baseline,
        revisedAmount: payload.revisedAmount ? Number(payload.revisedAmount) : null,
      })
    );
  },
  update: async (id, payload) => unwrap(await apiClient.put(`/costs/budgets/${id}`, payload)),
  authorizeRevision: async (id, payload) =>
    unwrap(await apiClient.put(`/costs/budgets/${id}/revision`, payload)),
  delete: async (id) => {
    await apiClient.delete(`/costs/budgets/${id}`);
    return true;
  },
};

// Ground consumption synchronization to Cost Actual Ledger (FR-072)
export const costSyncApi = {
  syncAll: async (projectId = 1) =>
    unwrap(await apiClient.post(`/costs/actual/sync/${projectId}`)),
  syncMaterial: async (projectId = 1) =>
    unwrap(await apiClient.post(`/costs/actual/sync-material/${projectId}`)),
  syncLabour: async (projectId = 1) =>
    unwrap(await apiClient.post(`/costs/actual/sync-labour/${projectId}`)),
  syncEquipment: async (projectId = 1) =>
    unwrap(await apiClient.post(`/costs/actual/sync-equipment/${projectId}`)),
};

// Cost transactions ledger entries (FR-072)
export const costTransactionApi = {
  list: async (projectId = 1) => {
    const response = await apiClient.get(`/costs/transactions/project/${projectId}`);
    return unwrapList(response);
  },
  create: async (payload) => unwrap(await apiClient.post('/costs/transactions', payload)),
  delete: async (id) => {
    await apiClient.delete(`/costs/transactions/${id}`);
    return true;
  },
};

// Variance, Overrun Alarms & Commitments (FR-072)
export const costVarianceApi = {
  getVarianceReport: async (projectId = 1) =>
    unwrap(await apiClient.get(`/costs/variance/project/${projectId}`)),
  getOverruns: async (projectId = 1) =>
    unwrap(await apiClient.get(`/costs/overruns/project/${projectId}`)),
  getCommitments: async (projectId = 1) =>
    unwrap(await apiClient.get(`/costs/commitments/project/${projectId}`)),
  getExpenditureTrail: async (projectId = 1) =>
    unwrap(await apiClient.get(`/costs/procurement/summary/${projectId}`)),
  triggerDailyCheck: async () =>
    unwrap(await apiClient.post('/costs/overruns/check')),
};

// EVM Analytics & Predictive Forecasts (FR-073)
export const costAnalyticsApi = {
  evm: async (projectId = 1, params = {}) =>
    unwrap(await apiClient.get(`/costs/evm/project/${projectId}`, { params })),
  forecast: async (projectId = 1) =>
    unwrap(await apiClient.get(`/costs/evm/forecast/${projectId}`)),
  tracking: async (projectId = 1) =>
    unwrap(await apiClient.get(`/costs/tracking/project/${projectId}`)),
  trends: async (projectId = 1, params = {}) =>
    unwrapList(await apiClient.get(`/costs/evm/trends/project/${projectId}`, { params })),
  snapshot: async (projectId = 1, params = {}) =>
    unwrap(await apiClient.post(`/costs/evm/calculate/project/${projectId}`, null, { params })),
};
