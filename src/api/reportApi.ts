// src/api/reportApi.ts
import { http } from './client';

export const reportApi = {
  // 1. Weekly Executive Briefing
  getWeeklyReport: (projectId: number, weekNumber = 10) =>
    http.get<any>(`/reports/weekly/${projectId}`, { weekNumber }),

  // 2. Material Inventory Valuation & Low Stock
  getInventoryReport: (projectId: number) =>
    http.get<any>(`/reports/inventory/${projectId}`),

  // 3. Procurement Commitments & Labour Wages
  getProcurementLabourReport: (projectId: number) =>
    http.get<any>(`/reports/procurement-labour/${projectId}`),

  // 4. CBS Cost Variance & Quality NCRs
  getCostQualityReport: (projectId: number) =>
    http.get<any>(`/reports/cost-quality/${projectId}`),

  // 5. Composite 0-100 Project Health Score
  getProjectAnalytics: (projectId: number) =>
    http.get<any>(`/reports/analytics/${projectId}`),
};
