// Enums matching Backend
export type IssueType = 'SNAG' | 'NCR' | 'ISSUE' | 'RISK' | 'BLOCKER';
export type IssueSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type IssueStatus = 'OPEN' | 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';

// Standard Backend Response Wrapper
export interface ApiResponse<T> {
  status: number;
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

// Master Project Issue Data Model
export interface ProjectIssue {
  id: number;
  ticketNumber: string;
  projectId: number;
  wbsActivityId?: number;
  title: string;
  description?: string;
  issueType: IssueType;
  severity: IssueSeverity;
  status: IssueStatus;
  reportedBy?: string;
  reportedRole?: string;
  assignedTo?: string;
  assignedToRole?: string;
  initialPhotoUrl?: string;
  targetResolutionDate?: string; // YYYY-MM-DD
  actualResolutionDate?: string; // YYYY-MM-DD
  resolutionRemarks?: string;
  resolutionPhotoUrl?: string;
  verifiedBy?: string;
  verificationRemarks?: string;
  verifiedAt?: string;
  isOverdue: boolean;
  createdAt: string;
  updatedAt: string;
}

// Step 1: Create Issue Request
export interface CreateProjectIssuePayload {
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

// Step 2: Assign & Set SLA Request
export interface AssignProjectIssuePayload {
  assignedTo: string;
  assignedToRole?: string;
  targetResolutionDate: string; // YYYY-MM-DD
  severity?: IssueSeverity;
}

// Step 3: Resolve Issue Request
export interface ResolveProjectIssuePayload {
  resolutionRemarks: string;
  resolutionPhotoUrl?: string;
  actualResolutionDate?: string; // YYYY-MM-DD
}

// Step 4: QA Verify Request
export interface VerifyProjectIssuePayload {
  approved: boolean;
  verifiedBy: string;
  verificationRemarks?: string;
}

// Step 5: Dashboard Analytics KPI
export interface ProjectIssueSummary {
  projectId: number;
  totalIssues: number;
  openCount: number;
  assignedCount: number;
  inProgressCount: number;
  resolvedCount: number;
  closedCount: number;
  snagCount: number;
  ncrCount: number;
  generalIssueCount: number;
  riskCount: number;
  blockerCount: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  overdueCount: number;
  resolutionPercentage: number;
}
