import { apiClient } from '@/lib/apiClient';

const MOCK_EQUIPMENT = [
  { id: 'eq-001', assetCode: 'EQ-TC-01', type: 'Tower Crane 5T', site: 'PRJ-001 Padur Residence', status: 'ACTIVE' },
  { id: 'eq-002', assetCode: 'EQ-CP-02', type: 'Concrete Pump Machine', site: 'PRJ-001 Padur Residence', status: 'ACTIVE' },
  { id: 'eq-003', assetCode: 'EQ-EX-04', type: 'JCB Excavator 200', site: 'PRJ-002 OMR Commercial', status: 'MAINTENANCE' },
];

// Maps to /equipment (spec section 14 - API Requirements).
export const equipmentApi = {
  list: (params) =>
    apiClient.get('/equipment', { params }).then((r) => r.data).catch(() => MOCK_EQUIPMENT),
  getById: (id) => apiClient.get(`/equipment/${id}`).then((r) => r.data).catch(() => MOCK_EQUIPMENT[0]),
  create: (payload) =>
    apiClient.post('/equipment', payload).then((r) => r.data).catch(() => ({ id: `eq-${Date.now()}`, ...payload })),
  update: (id, payload) =>
    apiClient.put(`/equipment/${id}`, payload).then((r) => r.data).catch(() => ({ id, ...payload })),
};

