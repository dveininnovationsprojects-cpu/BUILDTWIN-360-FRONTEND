import { apiClient } from '@/lib/apiClient';

const MOCK_REPORTS = [
  { id: 'rep-001', name: 'Weekly Executive Portfolio S-Curve Progress Report', period: 'Aug 18 - Aug 25, 2026', generatedAt: '2026-08-25 18:00', format: 'PDF Document' },
  { id: 'rep-002', name: 'Monthly Earned Value (EVM) Budget & Cost Variance', period: 'July 2026', generatedAt: '2026-08-01 09:00', format: 'Excel Workbook' },
  { id: 'rep-003', name: 'Site Material Consumption & Wastage Audit', period: 'Aug 01 - Aug 25, 2026', generatedAt: '2026-08-25 12:30', format: 'PDF Document' },
];

let currentReports = [...MOCK_REPORTS];

// Simulated client-side store for reports (FR-130..135)
export const reportsApi = {
  list: async () => [...currentReports],
  getById: async (id) => currentReports.find((r) => r.id === id) || currentReports[0],
  create: async (payload) => {
    const record = { id: `rep-${Date.now()}`, generatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16), ...payload };
    currentReports = [record, ...currentReports];
    return record;
  },
  update: async (id, payload) => {
    currentReports = currentReports.map((r) => (r.id === id ? { ...r, ...payload } : r));
    return { id, ...payload };
  },
};


