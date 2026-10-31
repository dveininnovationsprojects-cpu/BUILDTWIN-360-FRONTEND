// src/api/types.ts

// --- Procurement & Suppliers ---
export interface Supplier {
  id: number;
  supplierCode: string;
  name: string;
  contactPerson?: string;
  phone: string;
  email?: string;
  gstin?: string;
  panNumber?: string;
  bankAccountNumber?: string;
  bankName?: string;
  bankIfscCode?: string;
  bankBranch?: string;
  categorySpecialization?: string;
  address?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING_VERIFICATION' | 'BLACKLISTED';
  createdAt?: string;
}

export interface SupplierCreateDto {
  supplierCode: string;
  name: string;
  contactPerson?: string;
  phone: string;
  email?: string;
  gstin?: string;
  panNumber?: string;
  bankAccountNumber?: string;
  bankName?: string;
  bankIfscCode?: string;
  bankBranch?: string;
  categorySpecialization?: string;
  address?: string;
  status?: string;
}

export interface MaterialRequest {
  id: number;
  projectId: number;
  materialId: number;
  requiredQty: number;
  requiredDate?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ORDERED';
  siteId?: number;
  wbsActivityId?: number;
  zone?: string;
  contractorId?: number;
  requestedBy?: string;
  approvedBy?: string;
  rejectionReason?: string;
  justification?: string;
  remarks?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MaterialRequestApprovalDto {
  status: 'APPROVED' | 'REJECTED';
  approvedBy: string;
  rejectionReason?: string;
}

export interface ProjectedShortageDto {
  materialId: number;
  materialName: string;
  currentStoreBalance: number;
  approvedIndentPendingQty: number;
  projectedShortageQty: number;
  unit: string;
}

export interface PurchaseOrder {
  id: number;
  poNumber?: string;
  supplierId: number;
  projectId: number;
  materialId?: number;
  orderQty?: number;
  unitRate?: number;
  amount?: number;
  deliveryDate?: string;
  status: 'PENDING_APPROVAL' | 'APPROVED' | 'ISSUED' | 'PARTIALLY_DELIVERED' | 'FULFILLED' | 'CANCELLED';
  approvedBy?: string;
  rejectionReason?: string;
  remarks?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PurchaseOrderApprovalDto {
  status: 'APPROVED' | 'REJECTED' | 'ISSUED';
  approvedBy: string;
  rejectionReason?: string;
}

export interface PurchaseOrderStatusDto {
  status: 'DRAFT' | 'ISSUED' | 'PARTIALLY_FULFILLED' | 'FULFILLED' | 'CANCELLED';
  remarks?: string;
}

export interface PoFulfillmentDto {
  poId: number;
  poNumber: string;
  orderedQty: number;
  totalReceivedQty: number;
  totalAcceptedQty: number;
  totalRejectedQty: number;
  remainingQtyToDeliver: number;
  fulfillmentPercentage: number;
  fulfillmentStatus: string;
}

export interface Grn {
  id: number;
  poId: number;
  materialId: number;
  dcNumber?: string;
  vehicleNumber?: string;
  gateEntryNumber?: string;
  receivedQty: number;
  acceptedQty: number;
  rejectedQty?: number;
  damageReason?: string;
  projectId?: number;
  siteId?: number;
  grnNumber?: string;
  rejectionReason?: string;
  receivedBy?: string;
  deliveryEvidenceUrl?: string;
  status: 'COMPLETED' | 'VOID';
  createdAt?: string;
}

// --- Cost & EVM Analytics ---
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

export interface CostSyncResultDto {
  projectId: number;
  entriesSynced: number;
  totalAmountSynced: number;
  message: string;
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
  budgetAtCompletion: number;
  plannedValue: number;
  earnedValue: number;
  actualCost: number;
  costVariance: number;
  scheduleVariance: number;
  cpi: number;
  spi: number;
  estimateAtCompletion: number;
  estimateToComplete: number;
  varianceAtCompletion: number;
  plannedProgressPercentage?: string;
  actualProgressPercentage?: string;
  spiStatus?: string;
  cpiStatus?: string;
}

export interface EvmForecastDto {
  projectId: number;
  bac: number;
  cpi: number;
  spi: number;
  estimateAtCompletion: number;
  estimateToComplete: number;
  varianceAtCompletion: number;
  projectedCostOverrun: boolean;
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

// --- Quality, Issues & Risks ---
export type IssueType = 'SNAG' | 'NCR' | 'ISSUE' | 'RISK' | 'BLOCKER';
export type IssueSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type IssueStatus = 'OPEN' | 'ASSIGNED' | 'IN_PROGRESS' | 'RECTIFICATION_SUBMITTED' | 'RESOLVED' | 'VERIFIED' | 'CLOSED' | 'REOPENED';

export interface QualityIssue {
  id: number;
  projectId: number;
  title: string;
  description?: string;
  issueType: 'SNAG' | 'NCR';
  severity: IssueSeverity;
  status: IssueStatus;
  location?: string;
  assignedTo?: string;
  dueDate?: string;
  rectificationNotes?: string;
  verifiedBy?: string;
  verificationNotes?: string;
}

export interface CreateProjectIssueDto {
  projectId: number;
  wbsActivityId?: number;
  title: string;
  description?: string;
  issueType: IssueType;
  severity: IssueSeverity;
  initialPhotoUrl?: string;
  reportedBy?: string;
  reportedRole?: string;
}

export interface AssignProjectIssueDto {
  assignedTo: string;
  assignedToRole?: string;
  targetResolutionDate: string; // YYYY-MM-DD
  severity?: IssueSeverity;
}

export interface ResolveProjectIssueDto {
  resolutionRemarks: string;
  resolutionPhotoUrl?: string;
  actualResolutionDate?: string;
}

export interface VerifyProjectIssueDto {
  approved: boolean;
  verifiedBy: string;
  verificationRemarks?: string;
}

export interface ProjectIssueResponseDto {
  id: number;
  projectId: number;
  wbsActivityId?: number;
  ticketNumber: string;
  title: string;
  description?: string;
  issueType: IssueType;
  severity: IssueSeverity;
  status: IssueStatus;
  initialPhotoUrl?: string;
  reportedBy?: string;
  assignedTo?: string;
  targetResolutionDate?: string;
  actualResolutionDate?: string;
  resolutionPhotoUrl?: string;
  resolutionRemarks?: string;
  verifiedBy?: string;
  verificationRemarks?: string;
  isOverdue: boolean;
  createdAt: string;
}

export interface IssueBlocker {
  id: number;
  projectId: number;
  title: string;
  description?: string;
  impactArea?: string;
  daysDelayed?: number;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
}

export interface ProjectRisk {
  id: number;
  projectId: number;
  title: string;
  description?: string;
  probability: number;
  impactRating: number;
  riskScore?: number;
  severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'IDENTIFIED' | 'MONITORED' | 'MITIGATED' | 'CLOSED';
  mitigationPlan?: string;
}

// --- Notifications ---
export interface Notification {
  id: number;
  projectId: number;
  recipientUsername: string;
  title: string;
  message: string;
  notificationType: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'UNREAD' | 'READ' | 'ARCHIVED';
  channel: string;
  createdAt: string;
}

export interface SendNotificationDto {
  projectId: number;
  recipientUsername?: string;
  targetRole?: string;
  title: string;
  message: string;
  notificationType: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
}

export interface NotificationSummaryDto {
  username: string;
  unreadCount: number;
  urgentCount: number;
  lastUpdated: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
