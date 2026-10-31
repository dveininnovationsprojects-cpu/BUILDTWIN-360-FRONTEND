// src/types/cost.ts
export type CostHead = 'MATERIAL' | 'LABOUR' | 'EQUIPMENT' | 'SUBCONTRACTOR' | 'OVERHEAD' | 'CONTINGENCY';

export interface Budget {
  id: number;
  projectId: number;
  activityId?: number;
  wbsActivityId?: number;
  costCode: string;
  costHead?: CostHead;
  description?: string;
  baselineAmount: number;
  allocatedAmount: number;
  revisedAmount?: number;
  revisionReason?: string;
  approvedBy?: string;
  currency: string;
}

export interface BudgetRequestDto {
  projectId: number;
  activityId?: number;
  wbsActivityId?: number;
  costCode: string;
  costHead?: CostHead;
  description?: string;
  baselineAmount?: number;
  allocatedAmount?: number;
  revisedAmount?: number;
  currency?: string;
}

export interface BudgetRevisionDto {
  revisedAmount: number;
  revisionReason: string;
  approvedBy: string;
}

export interface MaterialActualCostSummaryDto {
  projectId: number;
  totalMaterialCostIncurred: number;
  totalTransactionsCount: number;
  currency: string;
}

export interface LabourActualCostSummaryDto {
  projectId: number;
  totalLabourCostIncurred: number;
  standardHoursCost: number;
  overtimeHoursCost: number;
  totalManHoursWorked: number;
  currency: string;
}

export interface CostSyncResultDto {
  projectId: number;
  entriesSynced: number;
  totalAmountSynced: number;
  message: string;
}

export interface ProjectCostTrackingReportDto {
  projectId: number;
  baselineBudget: number;
  revisedBudget: number;
  materialActualCost: number;
  labourActualCost: number;
  equipmentActualCost: number;
  subcontractorCost: number;
  totalIncurredCost: number;
  budgetUtilizationPercentage: number;
}

export interface ProcurementCommitmentDto {
  projectId: number;
  totalCommittedLiability: number;
  activeIssuedPoCount: number;
  items: Array<{
    poId: number;
    poNumber: string;
    supplierName: string;
    committedAmount: number;
    deliveryDate: string;
  }>;
}

export interface ProcurementExpenditureTrailDto {
  projectId: number;
  totalCommittedPoCost: number;
  totalIncurredGrnCost: number;
  liabilityGapAmount: number;
}

export interface BudgetVarianceReportDto {
  projectId: number;
  totalAllocatedBudget: number;
  totalActualCost: number;
  overallCostVariance: number;
  costVariancePercentage: number;
  thresholdAlertFlag: boolean;
  varianceItems: Array<{
    costCode: string;
    allocatedBudget: number;
    actualExpense: number;
    variance: number;
    status: 'NORMAL' | 'NEAR_THRESHOLD' | 'OVERRUN';
  }>;
}

export interface BudgetOverrunReportDto {
  projectId: number;
  totalOverrunAmount: number;
  overrunCount: number;
  overruns: Array<{
    costCode: string;
    activityTitle: string;
    allocatedBudget: number;
    committedPlusActualCost: number;
    exceededPercentage: number;
    severity: 'MEDIUM' | 'HIGH' | 'CRITICAL';
  }>;
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
  costHealth: 'UNDER_BUDGET' | 'ON_BUDGET' | 'OVER_BUDGET';
  scheduleHealth: 'AHEAD_OF_SCHEDULE' | 'ON_SCHEDULE' | 'BEHIND_SCHEDULE';
}

export interface EvmForecastDto {
  projectId: number;
  bac: number;
  cpi: number;
  spi: number;
  estimateAtCompletion: number; // EAC = BAC / CPI
  estimateToComplete: number;   // ETC = EAC - AC
  varianceAtCompletion: number; // VAC = BAC - EAC
  projectedCostOverrun: boolean;
}

export interface ProjectEVMRecord {
  id: number;
  projectId: number;
  evaluationDate: string;
  pv?: number;
  ev?: number;
  ac?: number;
  plannedValue?: number;
  earnedValue?: number;
  actualCost?: number;
  cpi: number;
  spi: number;
  plannedProgressPercentage?: number;
  actualProgressPercentage?: number;
}

export interface CostTransactionRequestDto {
  projectId: number;
  wbsActivityId?: number;
  costCode: string;
  costHead: CostHead;
  amount: number;
  transactionType: 'PO_COMMITMENT' | 'ACTUAL_INVOICE' | 'LABOUR_WAGES' | 'EQUIPMENT_HIRE' | 'SUBCONTRACT_PAYOUT';
  referenceNo?: string;
  payeeName?: string;
  remarks?: string;
}

export interface CostTransaction {
  id: number;
  projectId: number;
  wbsActivityId?: number;
  costCode: string;
  costHead: CostHead;
  amount: number;
  transactionType: string;
  referenceNo?: string;
  payeeName?: string;
  remarks?: string;
  createdAt: string;
}
