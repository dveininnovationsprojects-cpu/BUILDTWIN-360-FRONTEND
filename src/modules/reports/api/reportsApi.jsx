import { apiClient } from '@/lib/apiClient';

const MOCK_REPORTS = [
  { id: 'rep-001', name: 'Weekly Executive Portfolio S-Curve Progress Report', period: 'Aug 18 - Aug 25, 2026', generatedAt: '2026-08-25 18:00', format: 'PDF Document' },
  { id: 'rep-002', name: 'Monthly Earned Value (EVM) Budget & Cost Variance', period: 'July 2026', generatedAt: '2026-08-01 09:00', format: 'Excel Workbook' },
  { id: 'rep-003', name: 'Site Material Consumption & Wastage Audit', period: 'Aug 01 - Aug 25, 2026', generatedAt: '2026-08-25 12:30', format: 'PDF Document' },
];

let currentReports = [...MOCK_REPORTS];

// Executive Reports & Analytics API (Backend Integration & Local Store)
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

  // Backend Epic 7 Executive Reports endpoints
  getWeeklyReport: async (projectId = 1, weekNumber = 10) => {
    try {
      const res = await apiClient.get(`/reports/weekly/${projectId}`, { params: { weekNumber } });
      return res.data?.data ?? res.data;
    } catch (_err) {
      return null;
    }
  },

  getInventoryReport: async (projectId = 1) => {
    try {
      const res = await apiClient.get(`/reports/inventory/${projectId}`);
      return res.data?.data ?? res.data;
    } catch (_err) {
      return null;
    }
  },

  getProcurementLabourReport: async (projectId = 1) => {
    try {
      const res = await apiClient.get(`/reports/procurement-labour/${projectId}`);
      return res.data?.data ?? res.data;
    } catch (_err) {
      return null;
    }
  },

  getCostQualityReport: async (projectId = 1) => {
    try {
      const res = await apiClient.get(`/reports/cost-quality/${projectId}`);
      return res.data?.data ?? res.data;
    } catch (_err) {
      return null;
    }
  },

  getAnalyticsAggregation: async (projectId = 1) => {
    try {
      const res = await apiClient.get(`/reports/analytics/${projectId}`);
      return res.data?.data ?? res.data;
    } catch (_err) {
      return null;
    }
  },
};
