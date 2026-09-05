import { apiClient } from '@/lib/apiClient';

const MOCK_ANALYTICS = [
  { id: 'an-001', project: 'PRJ-001 Padur Residence', healthIndex: '78.7 / 100 (Amber)', delayRisk: '72.0 (High Risk)', forecastCompletion: 'Oct 12, 2026 (+12 Days)' },
  { id: 'an-002', project: 'PRJ-002 OMR Commercial Block', healthIndex: '86.2 / 100 (Green)', delayRisk: '34.0 (Low Risk)', forecastCompletion: 'Sep 30, 2026 (On Schedule)' },
];

// Maps to /analytics/project-health (spec section 14 - API Requirements).
export const analyticsApi = {
  list: (params) =>
    apiClient
      .get('/analytics/project-health', { params })
      .then((r) => r.data)
      .catch(() => MOCK_ANALYTICS),
  getById: (id) =>
    apiClient
      .get(`/analytics/project-health/${id}`)
      .then((r) => r.data)
      .catch(() => MOCK_ANALYTICS[0]),
  create: (payload) => apiClient.post('/analytics/project-health', payload).then((r) => r.data),
  update: (id, payload) => apiClient.put(`/analytics/project-health/${id}`, payload).then((r) => r.data),
};
