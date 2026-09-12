import { apiClient } from '@/lib/apiClient';

const MOCK_PROCUREMENT = [
  { id: 'po-101', poNumber: 'PO-2026-001', supplier: 'Chennai Ready-Mix Concrete Co.', deliveryDate: '2026-08-28', status: 'DELIVERED' },
  { id: 'po-102', poNumber: 'PO-2026-002', supplier: 'TATA Tiscon Rebar Suppliers', deliveryDate: '2026-09-02', status: 'IN_TRANSIT' },
  { id: 'po-103', poNumber: 'PO-2026-003', supplier: 'UltraTech Cement Distributors', deliveryDate: '2026-08-30', status: 'PENDING' },
];

// Maps to /purchase-orders (spec section 14 - API Requirements).
export const procurementApi = {
  list: (params = {}) =>
    apiClient.get(params.projectId ? `/procurement/purchase-orders/project/${params.projectId}` : '/procurement/purchase-orders', { params: params.projectId ? undefined : params }).then((r) => r.data).catch(() => MOCK_PROCUREMENT),
  getById: (id) => apiClient.get(`/procurement/purchase-orders/${id}`).then((r) => r.data).catch(() => MOCK_PROCUREMENT[0]),
  create: (payload) =>
    apiClient.post('/procurement/purchase-orders', payload).then((r) => r.data).catch(() => ({ id: `po-${Date.now()}`, ...payload })),
  update: (id, payload) =>
    apiClient.put(`/procurement/purchase-orders/${id}`, payload).then((r) => r.data).catch(() => ({ id, ...payload })),
};

