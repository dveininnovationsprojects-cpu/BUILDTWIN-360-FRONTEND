import { apiClient } from '@/lib/apiClient';

const MOCK_DOCUMENTS = [
  { id: 'doc-001', name: 'Structural Approval Blueprint Floor 1-3.pdf', category: 'Structural Drawing', uploadedBy: 'Eng. Rajesh (Site PM)', version: 'v2.1' },
  { id: 'doc-002', name: 'Quality Inspection Report Ground Slab.pdf', category: 'Quality Report', uploadedBy: 'Quality Lead Sundar', version: 'v1.0' },
  { id: 'doc-003', name: 'Approved BOQ & Material Requisition Sheet.xlsx', category: 'BOQ / Estimation', uploadedBy: 'QS Coordinator', version: 'v3.0' },
];

// Maps to /documents (spec section 14 - API Requirements).
export const documentsApi = {
  list: (params) =>
    apiClient.get('/documents', { params }).then((r) => r.data).catch(() => MOCK_DOCUMENTS),
  getById: (id) => apiClient.get(`/documents/${id}`).then((r) => r.data).catch(() => MOCK_DOCUMENTS[0]),
  create: (payload) =>
    apiClient.post('/documents', payload).then((r) => r.data).catch(() => ({ id: `doc-${Date.now()}`, ...payload })),
  update: (id, payload) =>
    apiClient.put(`/documents/${id}`, payload).then((r) => r.data).catch(() => ({ id, ...payload })),
};

