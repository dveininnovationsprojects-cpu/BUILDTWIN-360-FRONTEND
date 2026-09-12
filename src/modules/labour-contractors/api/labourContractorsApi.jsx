import { apiClient } from '@/lib/apiClient';

const MOCK_LABOUR = [
  { id: 'lbr-001', date: '2026-08-25', contractor: 'Sri Lakshmi Masonry Works', trade: 'Masonry & Concrete', headcount: '14 Workers (10 Masons, 4 Helpers)' },
  { id: 'lbr-002', date: '2026-08-25', contractor: 'Venkateswara Steel Bending Co.', trade: 'Rebar & Steel Bending', headcount: '8 Fitters' },
  { id: 'lbr-003', date: '2026-08-24', contractor: 'Star Carpentry & Shuttering', trade: 'Formwork / Carpentry', headcount: '12 Carpenters' },
];

// Maps to /labour/daily (spec section 14 - API Requirements).
export const labourContractorsApi = {
  list: (params = {}) =>
    apiClient.get(params.projectId ? `/labour/daily/project/${params.projectId}` : '/labour/daily', { params: params.projectId ? undefined : params }).then((r) => r.data).catch(() => MOCK_LABOUR),
  getById: (id) => apiClient.get(`/labour/daily/${id}`).then((r) => r.data).catch(() => MOCK_LABOUR[0]),
  create: (payload) =>
    apiClient.post('/labour/daily', payload).then((r) => r.data).catch(() => ({ id: `lbr-${Date.now()}`, ...payload })),
  update: (id, payload) =>
    apiClient.put(`/labour/daily/${id}`, payload).then((r) => r.data).catch(() => ({ id, ...payload })),
};

