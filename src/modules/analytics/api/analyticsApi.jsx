import { apiClient } from '@/lib/apiClient';

const MOCK_ANALYTICS = [
  { id: 'an-001', project: 'PRJ-001 Padur Residence', healthIndex: '78.7 / 100 (Amber)', delayRisk: '72.0 (High Risk)', forecastCompletion: 'Oct 12, 2026 (+12 Days)' },
  { id: 'an-002', project: 'PRJ-002 OMR Commercial Block', healthIndex: '86.2 / 100 (Green)', delayRisk: '34.0 (Low Risk)', forecastCompletion: 'Sep 30, 2026 (On Schedule)' },
];

let currentAnalytics = [...MOCK_ANALYTICS];

// Simulated client-side store for analytics KPIs (FR-130..135)
export const analyticsApi = {
  list: async () => [...currentAnalytics],
  getById: async (id) => currentAnalytics.find((a) => a.id === id) || currentAnalytics[0],
  create: async (payload) => {
    const record = { id: `an-${Date.now()}`, ...payload };
    currentAnalytics = [record, ...currentAnalytics];
    return record;
  },
  update: async (id, payload) => {
    currentAnalytics = currentAnalytics.map((a) => (a.id === id ? { ...a, ...payload } : a));
    return { id, ...payload };
  },
};

