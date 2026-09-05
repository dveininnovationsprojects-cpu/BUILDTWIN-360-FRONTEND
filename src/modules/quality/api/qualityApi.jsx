import { apiClient } from '@/lib/apiClient';

const MOCK_QUALITY = [
  { id: 'qlt-042', code: 'NCR-042', project: 'PRJ-001 Padur Residence', title: 'Slab Honeycombing & Voids', severity: 'HIGH', status: 'OPEN', ageingDays: '10 Days' },
  { id: 'qlt-043', code: 'NCR-043', project: 'PRJ-001 Padur Residence', title: 'Rebar Cover Block Displacement', severity: 'MEDIUM', status: 'IN_REVIEW', ageingDays: '3 Days' },
  { id: 'qlt-044', code: 'NCR-044', project: 'PRJ-002 OMR Commercial', title: 'Curing Period Non-compliance', severity: 'LOW', status: 'CLOSED', ageingDays: '0 Days' },
];

// Maps to /quality-issues (spec section 14 - API Requirements).
export const qualityApi = {
  list: (params) =>
    apiClient.get('/quality-issues', { params }).then((r) => r.data).catch(() => MOCK_QUALITY),
  getById: (id) => apiClient.get(`/quality-issues/${id}`).then((r) => r.data).catch(() => MOCK_QUALITY[0]),
  create: (payload) =>
    apiClient.post('/quality-issues', payload).then((r) => r.data).catch(() => ({ id: `qlt-${Date.now()}`, ...payload })),
  update: (id, payload) =>
    apiClient.put(`/quality-issues/${id}`, payload).then((r) => r.data).catch(() => ({ id, ...payload })),
};

