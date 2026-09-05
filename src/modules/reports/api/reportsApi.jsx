import { apiClient } from '@/lib/apiClient';

const MOCK_REPORTS = [
  { id: 'rep-001', name: 'Weekly Executive Portfolio S-Curve Progress Report', period: 'Aug 18 - Aug 25, 2026', generatedAt: '2026-08-25 18:00', format: 'PDF Document' },
  { id: 'rep-002', name: 'Monthly Earned Value (EVM) Budget & Cost Variance', period: 'July 2026', generatedAt: '2026-08-01 09:00', format: 'Excel Workbook' },
  { id: 'rep-003', name: 'Site Material Consumption & Wastage Audit', period: 'Aug 01 - Aug 25, 2026', generatedAt: '2026-08-25 12:30', format: 'PDF Document' },
];

// Maps to /reports (spec section 14 - API Requirements).
export const reportsApi = {
  list: (params) =>
    apiClient.get('/reports', { params }).then((r) => r.data).catch(() => MOCK_REPORTS),
  getById: (id) => apiClient.get(`/reports/${id}`).then((r) => r.data).catch(() => MOCK_REPORTS[0]),
  create: (payload) =>
    apiClient.post('/reports', payload).then((r) => r.data).catch(() => ({ id: `rep-${Date.now()}`, ...payload })),
  update: (id, payload) =>
    apiClient.put(`/reports/${id}`, payload).then((r) => r.data).catch(() => ({ id, ...payload })),
};

