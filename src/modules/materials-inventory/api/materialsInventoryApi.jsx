import { apiClient } from '@/lib/apiClient';

const MOCK_MATERIALS = [
  { id: 'mat-001', code: 'MAT-CEM-43', name: 'OPC 43 Grade Cement', category: 'Binder', unit: 'Bags', stockBalance: '120 Bags', depletionForecast: '4 Days (Aug 29)', status: 'LOW_STOCK' },
  { id: 'mat-002', code: 'MAT-STE-12', name: 'Fe500D TMT Rebar 12mm', category: 'Steel', unit: 'MT', stockBalance: '8.5 MT', depletionForecast: '14 Days (Sep 08)', status: 'HEALTHY' },
  { id: 'mat-003', code: 'MAT-CON-M25', name: 'Ready-Mix Concrete M25', category: 'Concrete', unit: 'm³', stockBalance: '45.0 m³', depletionForecast: 'On Demand', status: 'HEALTHY' },
];

// Maps to /materials (spec section 14 - API Requirements).
export const materialsInventoryApi = {
  list: (params) =>
    apiClient.get('/materials', { params }).then((r) => r.data).catch(() => MOCK_MATERIALS),
  getById: (id) => apiClient.get(`/materials/${id}`).then((r) => r.data).catch(() => MOCK_MATERIALS[0]),
  create: (payload) =>
    apiClient.post('/materials', payload).then((r) => r.data).catch(() => ({ id: `mat-${Date.now()}`, ...payload })),
  update: (id, payload) =>
    apiClient.put(`/materials/${id}`, payload).then((r) => r.data).catch(() => ({ id, ...payload })),
};

