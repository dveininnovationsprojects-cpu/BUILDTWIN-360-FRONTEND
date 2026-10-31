// src/api/costApi.ts
import { http } from './client';
import {
  Budget,
  BudgetRequestDto,
  BudgetRevisionDto,
  CostSyncResultDto,
  BudgetVarianceReportDto,
  BudgetOverrunReportDto,
  EvmMetricsDto,
  EvmForecastDto,
  CostTransaction,
} from './types';

export const costApi = {
  // Baseline Budgets
  createOrUpdateBudget: (dto: BudgetRequestDto) =>
    http.post<Budget>('/costs/budgets', dto),
  updateBudget: (id: number, dto: BudgetRequestDto) =>
    http.put<Budget>(`/costs/budgets/${id}`, dto),
  authorizeBudgetRevision: (id: number, dto: BudgetRevisionDto) =>
    http.put<Budget>(`/costs/budgets/${id}/revision`, dto),
  getAllBudgets: (projectId?: number) =>
    http.get<Budget[]>('/costs/budgets', { projectId }),
  getBudgetsByProject: (projectId: number) =>
    http.get<Budget[]>(`/costs/budgets/project/${projectId}`),
  getBudgetsByActivity: (projectId: number, activityId: number) =>
    http.get<Budget[]>(`/costs/budgets/project/${projectId}/activity/${activityId}`),
  deleteBudget: (id: number) =>
    http.delete<void>(`/costs/budgets/${id}`),

  // Autonomous Ledger Sync
  syncActualCosts: (projectId: number) =>
    http.post<CostSyncResultDto>(`/costs/actual/sync/${projectId}`),
  syncMaterialCost: (projectId: number) =>
    http.post<CostSyncResultDto>(`/costs/actual/sync-material/${projectId}`),
  syncLabourCost: (projectId: number) =>
    http.post<CostSyncResultDto>(`/costs/actual/sync-labour/${projectId}`),
  syncEquipmentCost: (projectId: number) =>
    http.post<CostSyncResultDto>(`/costs/actual/sync-equipment/${projectId}`),
  getCostTrackingReport: (projectId: number) =>
    http.get<any>(`/costs/tracking/project/${projectId}`),

  // Variance & Overrun Alarms
  getBudgetVarianceReport: (projectId: number) =>
    http.get<BudgetVarianceReportDto>(`/costs/variance/project/${projectId}`),
  getBudgetOverruns: (projectId: number) =>
    http.get<BudgetOverrunReportDto>(`/costs/overruns/project/${projectId}`),
  triggerDailyBudgetOverrunCheck: () =>
    http.post<string>('/costs/overruns/check'),

  // EVM Analytics & S-Curve (FR-073)
  calculateEvmSnapshot: (projectId: number, plannedProgress?: number, actualProgress?: number) =>
    http.post<any>(`/costs/evm/calculate/project/${projectId}`, null, { plannedProgress, actualProgress }),
  getEvmMetrics: (projectId: number, plannedProgress?: number, actualProgress?: number) =>
    http.get<EvmMetricsDto>(`/costs/evm/project/${projectId}`, { plannedProgress, actualProgress }),
  getEvmTrends: (projectId: number, startDate?: string, endDate?: string) =>
    http.get<any[]>(`/costs/evm/trends/project/${projectId}`, { startDate, endDate }),
  getEvmForecast: (projectId: number) =>
    http.get<EvmForecastDto>(`/costs/evm/forecast/${projectId}`),

  // Cost Transactions
  recordCostTransaction: (dto: any) =>
    http.post<CostTransaction>('/costs/transactions', dto),
  getCostTransactionsByProject: (projectId: number) =>
    http.get<CostTransaction[]>(`/costs/transactions/project/${projectId}`),
  deleteCostTransaction: (id: number) =>
    http.delete<void>(`/costs/transactions/${id}`),
};
