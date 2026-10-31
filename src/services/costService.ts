// src/services/costService.ts
import apiClient from '../api/client';
import {
  Budget,
  BudgetRequestDto,
  BudgetRevisionDto,
  MaterialActualCostSummaryDto,
  LabourActualCostSummaryDto,
  CostSyncResultDto,
  ProjectCostTrackingReportDto,
  ProcurementCommitmentDto,
  ProcurementExpenditureTrailDto,
  BudgetVarianceReportDto,
  BudgetOverrunReportDto,
  EvmMetricsDto,
  EvmForecastDto,
  ProjectEVMRecord,
  CostTransactionRequestDto,
  CostTransaction,
} from '../types/cost';

export const costService = {
  // =================================================
  // Baseline Budgets & Revisions (/api/v1/costs/budgets)
  // =================================================
  async createOrUpdateBudget(dto: BudgetRequestDto): Promise<Budget> {
    return apiClient.post('/costs/budgets', dto);
  },

  async updateBudget(id: number, dto: BudgetRequestDto): Promise<Budget> {
    return apiClient.put(`/costs/budgets/${id}`, dto);
  },

  async authorizeBudgetRevision(id: number, dto: BudgetRevisionDto): Promise<Budget> {
    return apiClient.put(`/costs/budgets/${id}/revision`, dto);
  },

  async getAllBudgets(projectId?: number): Promise<Budget[]> {
    const params = projectId ? { projectId } : {};
    return apiClient.get('/costs/budgets', { params });
  },

  async getBudgetById(id: number): Promise<Budget> {
    return apiClient.get(`/costs/budgets/${id}`);
  },

  async getBudgetsByProject(projectId: number): Promise<Budget[]> {
    return apiClient.get(`/costs/budgets/project/${projectId}`);
  },

  async getBudgetsByProjectAndActivity(projectId: number, activityId: number): Promise<Budget[]> {
    return apiClient.get(`/costs/budgets/project/${projectId}/activity/${activityId}`);
  },

  async deleteBudget(id: number): Promise<void> {
    return apiClient.delete(`/costs/budgets/${id}`);
  },

  // =======================================================
  // Actual Incurred Costs & Sync Engines (/api/v1/costs/actual)
  // =======================================================
  async getMaterialActualCostSummary(projectId: number): Promise<MaterialActualCostSummaryDto> {
    return apiClient.get(`/costs/actual/material/project/${projectId}`);
  },

  async getLabourActualCostSummary(projectId: number): Promise<LabourActualCostSummaryDto> {
    return apiClient.get(`/costs/actual/labour/project/${projectId}`);
  },

  // Sync with Path Variable
  async syncActualCosts(projectId: number): Promise<CostSyncResultDto> {
    return apiClient.post(`/costs/actual/sync/${projectId}`);
  },

  // Sync with Query Param (?projectId=1)
  async syncActualCostsQuery(projectId?: number): Promise<CostSyncResultDto> {
    const params = projectId ? { projectId } : {};
    return apiClient.post('/costs/actual/sync', null, { params });
  },

  async syncMaterialCost(projectId: number): Promise<CostSyncResultDto> {
    return apiClient.post(`/costs/actual/sync-material/${projectId}`);
  },

  async syncMaterialCostQuery(projectId?: number): Promise<CostSyncResultDto> {
    const params = projectId ? { projectId } : {};
    return apiClient.post('/costs/actual/sync-material', null, { params });
  },

  async syncLabourCost(projectId: number): Promise<CostSyncResultDto> {
    return apiClient.post(`/costs/actual/sync-labour/${projectId}`);
  },

  async syncLabourCostQuery(projectId?: number): Promise<CostSyncResultDto> {
    const params = projectId ? { projectId } : {};
    return apiClient.post('/costs/actual/sync-labour', null, { params });
  },

  async syncEquipmentCost(projectId: number): Promise<CostSyncResultDto> {
    return apiClient.post(`/costs/actual/sync-equipment/${projectId}`);
  },

  async syncEquipmentCostQuery(projectId?: number): Promise<CostSyncResultDto> {
    const params = projectId ? { projectId } : {};
    return apiClient.post('/costs/actual/sync-equipment', null, { params });
  },

  async getProjectCostTracking(projectId: number): Promise<ProjectCostTrackingReportDto> {
    return apiClient.get(`/costs/tracking/project/${projectId}`);
  },

  // =======================================================
  // Commitments & Liabilities
  // =======================================================
  async getProcurementCommitments(projectId: number): Promise<ProcurementCommitmentDto> {
    return apiClient.get(`/costs/commitments/project/${projectId}`);
  },

  async getProcurementExpenditureTrail(projectId: number): Promise<ProcurementExpenditureTrailDto> {
    return apiClient.get(`/costs/procurement/summary/${projectId}`);
  },

  // =======================================================
  // Variance & Overrun Alarms
  // =======================================================
  async getBudgetVarianceReport(projectId: number): Promise<BudgetVarianceReportDto> {
    return apiClient.get(`/costs/variance/project/${projectId}`);
  },

  async getBudgetOverruns(projectId: number): Promise<BudgetOverrunReportDto> {
    return apiClient.get(`/costs/overruns/project/${projectId}`);
  },

  async triggerDailyBudgetOverrunCheck(): Promise<string> {
    return apiClient.post('/costs/overruns/check');
  },

  // =======================================================
  // EVM Analytics & S-Curve Forecasting (FR-073)
  // =======================================================
  async calculateEvmSnapshot(projectId: number, plannedProgress?: number, actualProgress?: number): Promise<ProjectEVMRecord> {
    const params: Record<string, any> = {};
    if (plannedProgress !== undefined) params.plannedProgress = plannedProgress;
    if (actualProgress !== undefined) params.actualProgress = actualProgress;
    return apiClient.post(`/costs/evm/calculate/project/${projectId}`, null, { params });
  },

  async getEvmMetrics(projectId: number, plannedProgress?: number, actualProgress?: number): Promise<EvmMetricsDto> {
    const params: Record<string, any> = {};
    if (plannedProgress !== undefined) params.plannedProgress = plannedProgress;
    if (actualProgress !== undefined) params.actualProgress = actualProgress;
    return apiClient.get(`/costs/evm/project/${projectId}`, { params });
  },

  async getEvmTrends(projectId: number, startDate?: string, endDate?: string): Promise<ProjectEVMRecord[]> {
    const params: Record<string, any> = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    return apiClient.get(`/costs/evm/trends/project/${projectId}`, { params });
  },

  async getEvmForecast(projectId: number): Promise<EvmForecastDto> {
    return apiClient.get(`/costs/evm/forecast/${projectId}`);
  },

  // =======================================================
  // Direct Cost Transactions & Raw Ledgers
  // =======================================================
  async recordCostTransaction(dto: CostTransactionRequestDto): Promise<CostTransaction> {
    return apiClient.post('/costs/transactions', dto);
  },

  async getAllCostTransactions(projectId?: number): Promise<CostTransaction[]> {
    const params = projectId ? { projectId } : {};
    return apiClient.get('/costs/transactions', { params });
  },

  async getCostTransactionsByProject(projectId: number): Promise<CostTransaction[]> {
    return apiClient.get(`/costs/transactions/project/${projectId}`);
  },

  async getCostTransactionById(id: number): Promise<CostTransaction> {
    return apiClient.get(`/costs/transactions/${id}`);
  },

  async updateCostTransaction(id: number, dto: CostTransactionRequestDto): Promise<CostTransaction> {
    return apiClient.put(`/costs/transactions/${id}`, dto);
  },

  async deleteCostTransaction(id: number): Promise<void> {
    return apiClient.delete(`/costs/transactions/${id}`);
  },

  async getCostActualLedgersByProject(projectId: number): Promise<any[]> {
    return apiClient.get(`/costs/actuals/ledger/project/${projectId}`);
  },

  async deleteCostActualLedger(id: number): Promise<void> {
    return apiClient.delete(`/costs/actuals/ledger/${id}`);
  },

  // Historical EVM Records & Mirrored Project Budgets
  async getEvmRecordById(id: number): Promise<ProjectEVMRecord> {
    return apiClient.get(`/costs/evm/records/${id}`);
  },

  async deleteEvmRecord(id: number): Promise<void> {
    return apiClient.delete(`/costs/evm/records/${id}`);
  },

  async getProjectBudgets(projectId: number): Promise<any[]> {
    return apiClient.get(`/costs/project-budgets/project/${projectId}`);
  },
};
