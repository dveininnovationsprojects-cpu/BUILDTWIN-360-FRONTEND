import { apiClient } from '@/lib/apiClient';

const MOCK_ISSUES = [
  { id: 'iss-001', title: 'Cement Stock Shortage for Slab Concreting', priority: 'HIGH', owner: 'Procurement Officer', status: 'OPEN' },
  { id: 'iss-002', title: 'Power Grid Tripping at Padur Site Block B', priority: 'CRITICAL', owner: 'Electrical Site Engineer', status: 'IN_PROGRESS' },
  { id: 'iss-003', title: 'Rainwater Accumulation in Footing Trench', priority: 'MEDIUM', owner: 'Safety Coordinator', status: 'RESOLVED' },
];

// Maps to /issues (spec section 14 - API Requirements).
export const issuesRisksApi = {
  list: (params = {}) =>
    apiClient.get(params.projectId ? `/issues/project/${params.projectId}` : '/issues', { params: params.projectId ? undefined : params }).then((r) => r.data).catch(() => MOCK_ISSUES),
  getById: (id) => apiClient.get(`/issues/${id}`).then((r) => r.data).catch(() => MOCK_ISSUES[0]),
  create: (payload) =>
    apiClient.post('/issues', payload).then((r) => r.data).catch(() => ({ id: `iss-${Date.now()}`, ...payload })),
  update: (id, payload) =>
    apiClient.post(`/issues/${id}/resolve`).then((r) => r.data).catch(() => ({ id, ...payload })),
};

