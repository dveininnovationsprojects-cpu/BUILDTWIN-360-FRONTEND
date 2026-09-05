import { apiClient } from '@/lib/apiClient';

const MOCK_BUDGETS = [
  { id: 'cst-001', code: 'WBS-1.1', category: 'Substructure Foundation', bac: '₹5,000,000', pv: '₹4,000,000', ev: '₹4,000,000', ac: '₹3,850,000', cpi: '1.039 (Under Budget)' },
  { id: 'cst-002', code: 'WBS-1.2', category: 'Superstructure RCC Frame', bac: '₹18,500,000', pv: '₹6,500,000', ev: '₹5,800,000', ac: '₹6,180,000', cpi: '0.938 (Over Budget)' },
  { id: 'cst-003', code: 'WBS-1.3', category: 'Masonry & Plastering Works', bac: '₹8,200,000', pv: '₹1,200,000', ev: '₹1,200,000', ac: '₹1,150,000', cpi: '1.043 (Under Budget)' },
];

// Maps to /budgets (spec section 14 - API Requirements).
export const costControlApi = {
  list: (params) =>
    apiClient.get('/budgets', { params }).then((r) => r.data).catch(() => MOCK_BUDGETS),
  getById: (id) => apiClient.get(`/budgets/${id}`).then((r) => r.data).catch(() => MOCK_BUDGETS[0]),
  create: (payload) =>
    apiClient.post('/budgets', payload).then((r) => r.data).catch(() => ({ id: `cst-${Date.now()}`, ...payload })),
  update: (id, payload) =>
    apiClient.put(`/budgets/${id}`, payload).then((r) => r.data).catch(() => ({ id, ...payload })),
};

