export type CostCode = 'MATERIAL' | 'LABOUR' | 'EQUIPMENT' | 'SUBCONTRACTOR' | 'OVERHEAD' | 'CONTINGENCY';

export interface Budget {
  id?: number;
  projectId: number;
  wbsActivityId?: number;
  costCode: string;
  costHead?: CostCode | string;
  allocatedAmount?: number;
  baselineAmount?: number;
  revisedAmount?: number;
  revisionReason?: string;
  approvedBy?: string;
  description?: string;
  status?: string;
}

export interface BudgetVarianceReportDto {
  projectId: number;
  totalAllocatedBudget: number;
  totalActualExpense: number;
  costVariance: number;
  costVariancePercentage: number;
  isOverBudget: boolean;
  status: 'SAFE' | 'WARNING_90' | 'OVERRUN';
}

export interface EvmMetricsDto {
  projectId: number;
  budgetAtCompletion: number; // BAC
  plannedValue: number;        // PV
  earnedValue: number;         // EV
  actualCost: number;          // AC
  costVariance: number;        // CV = EV - AC
  scheduleVariance: number;    // SV = EV - PV
  cpi: number;                 // Cost Performance Index = EV / AC
  spi: number;                 // Schedule Performance Index = EV / PV
  costPerformanceIndex?: number;
  schedulePerformanceIndex?: number;
  statusCost: 'UNDER_BUDGET' | 'ON_BUDGET' | 'OVER_BUDGET';
  statusSchedule: 'AHEAD_OF_SCHEDULE' | 'ON_SCHEDULE' | 'BEHIND_SCHEDULE';
}

export interface EvmForecastDto {
  projectId: number;
  budgetAtCompletion: number;
  estimateAtCompletion: number; // EAC = BAC / CPI
  estimateToComplete: number;   // ETC = EAC - AC
  varianceAtCompletion: number; // VAC = BAC - EAC
  forecastSummary: string;
}
