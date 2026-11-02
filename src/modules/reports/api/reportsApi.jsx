import { apiClient } from '@/lib/apiClient';

const MOCK_REPORTS = [
  {
    id: 'rep-001',
    name: 'Weekly Executive Portfolio S-Curve Progress Report',
    period: 'Week 10 (Aug 18 - Aug 25, 2026)',
    generatedAt: '2026-08-25 18:00',
    format: 'PDF Document',
    type: 'WEEKLY',
    status: 'COMPLETED',
    size: '2.4 MB',
    author: 'Director / Management',
  },
  {
    id: 'rep-002',
    name: 'Monthly Earned Value (EVM) Budget & Cost Variance',
    period: 'July 2026',
    generatedAt: '2026-08-01 09:00',
    format: 'Excel Workbook',
    type: 'COST_QUALITY',
    status: 'COMPLETED',
    size: '1.8 MB',
    author: 'Quantity Cost Coordinator',
  },
  {
    id: 'rep-003',
    name: 'Site Material Consumption & Wastage Audit',
    period: 'Aug 01 - Aug 25, 2026',
    generatedAt: '2026-08-25 12:30',
    format: 'PDF Document',
    type: 'INVENTORY',
    status: 'COMPLETED',
    size: '3.1 MB',
    author: 'Procurement & Store',
  },
  {
    id: 'rep-004',
    name: 'Unified Procurement Commitments & Contractor Wages Audit',
    period: 'Week 10 (Aug 2026)',
    generatedAt: '2026-08-26 10:15',
    format: 'PDF Document',
    type: 'PROCUREMENT_LABOUR',
    status: 'COMPLETED',
    size: '1.5 MB',
    author: 'Project Manager',
  },
  {
    id: 'rep-005',
    name: 'Executive Composite Project Health & Risk Radar',
    period: 'Q3 2026 Executive Review',
    generatedAt: '2026-08-28 14:00',
    format: 'PDF Document',
    type: 'ANALYTICS',
    status: 'COMPLETED',
    size: '2.9 MB',
    author: 'Data Analyst',
  },
];

let currentReports = [...MOCK_REPORTS];

// Executive Reports & Analytics API (Backend Integration & Local Archive Store)
export const reportsApi = {
  list: async () => [...currentReports],
  getById: async (id) => currentReports.find((r) => r.id === id) || currentReports[0],
  create: async (payload) => {
    const record = {
      id: `rep-${Date.now()}`,
      generatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'COMPLETED',
      size: `${(Math.random() * 2 + 1.2).toFixed(1)} MB`,
      ...payload,
    };
    currentReports = [record, ...currentReports];
    return record;
  },
  delete: async (id) => {
    currentReports = currentReports.filter((r) => r.id !== id);
    return { success: true, id };
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
