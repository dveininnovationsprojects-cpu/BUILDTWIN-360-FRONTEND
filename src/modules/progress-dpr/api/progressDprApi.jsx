import { apiClient } from '@/lib/apiClient';

const MOCK_DPRS = [
  { id: 'dpr-001', date: '2026-08-25', project: 'PRJ-001 Padur Residence', activity: 'Slab Concreting', qtyCompleted: '12.5 m³', status: 'APPROVED' },
  { id: 'dpr-002', date: '2026-08-24', project: 'PRJ-001 Padur Residence', activity: 'Column Reinforcement', qtyCompleted: '100%', status: 'APPROVED' },
  { id: 'dpr-003', date: '2026-08-25', project: 'PRJ-002 OMR Commercial', activity: 'Footing Excavation', qtyCompleted: '45.0 m³', status: 'SUBMITTED' },
];

// Maps to /dpr (spec section 14 - API Requirements).
export const progressDprApi = {
  list: (params) =>
    apiClient.get('/dpr', { params }).then((r) => r.data).catch(() => MOCK_DPRS),
  getById: (id) => apiClient.get(`/dpr/${id}`).then((r) => r.data).catch(() => MOCK_DPRS[0]),
  create: (payload) =>
    apiClient.post('/dpr', payload).then((r) => r.data).catch(() => ({ id: `dpr-${Date.now()}`, ...payload })),
  update: (id, payload) =>
    apiClient.put(`/dpr/${id}`, payload).then((r) => r.data).catch(() => ({ id, ...payload })),
};

