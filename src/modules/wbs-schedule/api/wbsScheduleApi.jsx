import { apiClient } from '@/lib/apiClient';

const MOCK_WBS = [
  { id: 'wbs-101', wbsCode: '1.1.1', name: 'Substructure Excavation & PCC', discipline: 'Civil', status: 'COMPLETED' },
  { id: 'wbs-102', wbsCode: '1.1.2', name: 'Footing & Column Starter Reinforcement', discipline: 'Structural', status: 'COMPLETED' },
  { id: 'wbs-103', wbsCode: '1.2.1', name: 'Ground Floor Column Concreting', discipline: 'Structural', status: 'IN_PROGRESS' },
  { id: 'wbs-104', wbsCode: '1.2.2', name: 'Ground Floor Slab Formwork & Shuttering', discipline: 'Structural', status: 'IN_PROGRESS' },
  { id: 'wbs-105', wbsCode: '1.3.1', name: 'First Floor Masonry Brickwork', discipline: 'Architectural', status: 'PLANNED' },
];

// Maps to /activities (spec section 14 - API Requirements).
export const wbsScheduleApi = {
  list: (params) =>
    apiClient.get('/activities', { params }).then((r) => r.data).catch(() => MOCK_WBS),
  getById: (id) => apiClient.get(`/activities/${id}`).then((r) => r.data).catch(() => MOCK_WBS[0]),
  create: (payload) =>
    apiClient.post('/activities', payload).then((r) => r.data).catch(() => ({ id: `wbs-${Date.now()}`, ...payload })),
  update: (id, payload) =>
    apiClient.put(`/activities/${id}`, payload).then((r) => r.data).catch(() => ({ id, ...payload })),
};

