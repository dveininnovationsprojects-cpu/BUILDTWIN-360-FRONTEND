import { apiClient } from '@/lib/apiClient';

const MOCK_AUDIT = [
  { id: 'aud-001', user: 'Eng. Rajesh (PM)', action: 'APPROVE_DPR', entityType: 'DPR Header #104', timestamp: '2026-08-25 18:30:00' },
  { id: 'aud-002', user: 'Procurement Admin', action: 'CREATE_PO', entityType: 'Purchase Order #PO-2026-001', timestamp: '2026-08-25 14:15:22' },
  { id: 'aud-003', user: 'Quality Engineer Sundar', action: 'RAISE_NCR', entityType: 'Quality Issue NCR-042', timestamp: '2026-08-25 11:05:40' },
];

// Maps to /audit-logs (spec section 14 - API Requirements).
export const auditApi = {
  list: (params) =>
    apiClient.get('/audit-logs', { params }).then((r) => r.data).then((data) => data?.content ?? data).catch(() => MOCK_AUDIT),
  getById: (id) => apiClient.get(`/audit-logs/${id}`).then((r) => r.data).catch(() => MOCK_AUDIT[0]),
  create: (payload) =>
    apiClient.post('/audit-logs', payload).then((r) => r.data).catch(() => ({ id: `aud-${Date.now()}`, ...payload })),
  update: (id, payload) =>
    apiClient.put(`/audit-logs/${id}`, payload).then((r) => r.data).catch(() => ({ id, ...payload })),
};

