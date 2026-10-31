// src/types/qualityAndIssues.ts
export type IssueType = 'SNAG' | 'NCR' | 'ISSUE' | 'RISK' | 'BLOCKER';
export type IssueSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type IssueStatus = 'OPEN' | 'ASSIGNED' | 'IN_PROGRESS' | 'RECTIFICATION_SUBMITTED' | 'RESOLVED' | 'VERIFIED' | 'CLOSED' | 'REOPENED';

export interface QualityIssue {
  id: number;
  projectId: number;
  issueCode?: string;
  title: string;
  description?: string;
  issueType: 'SNAG' | 'NCR';
  severity: IssueSeverity;
  status: IssueStatus;
  location?: string;
  assignedTo?: string;
  dueDate?: string;
  rectificationNotes?: string;
  rectifiedBy?: string;
  rectifiedAt?: string;
  verifiedBy?: string;
  verificationNotes?: string;
  verifiedAt?: string;
  evidenceCount?: number;
  createdAt?: string;
}

export interface QualityResolutionDto {
  rectificationNotes?: string;
  resolutionNotes?: string;
  rectifiedBy?: string;
  resolvedBy?: string;
  rectificationPhotoUrl?: string;
}

export interface QualityVerificationDto {
  approved: boolean;
  verifiedBy: string;
  verificationNotes?: string;
  remarks?: string;
}

export interface QualityEvidence {
  id?: number;
  qualityIssueId: number;
  photoUrl: string;
  evidenceType: 'DEFECT_CAPTURE' | 'RECTIFICATION_PROOF';
  uploadedBy?: string;
  caption?: string;
  createdAt?: string;
}

export interface QualitySummaryDto {
  projectId: number;
  totalIssues: number;
  openSnags: number;
  openNcrs: number;
  pendingVerifications: number;
  closedIssues: number;
  criticalCount: number;
}

// 5-Step Master Workflow DTOs
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

export interface ProjectIssueSummaryDto {
  projectId: number;
  totalTickets: number;
  openCount: number;
  assignedCount: number;
  inProgressCount: number;
  resolvedCount: number;
  closedCount: number;
  overdueCount: number;
  resolutionPercentage: number;
}

// Blocker & Risk Register
export interface IssueBlocker {
  id: number;
  projectId: number;
  title: string;
  description?: string;
  impactArea?: string;
  priority?: string;
  severity?: string;
  owner?: string;
  dueDate?: string;
  daysDelayed?: number;
  causeCode?: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  resolvedAt?: string;
  resolutionNotes?: string;
}

export interface ProjectRisk {
  id: number;
  projectId: number;
  title: string;
  description?: string;
  category?: string;
  probability: number; // 1 to 5
  impactRating: number; // 1 to 5
  riskScore?: number; // probability * impact
  severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'IDENTIFIED' | 'MONITORED' | 'MITIGATED' | 'CLOSED';
  mitigationPlan?: string;
  contingencyPlan?: string;
  owner?: string;
}

export interface RiskStatusUpdateDto {
  status: 'IDENTIFIED' | 'MONITORED' | 'MITIGATED' | 'CLOSED';
  mitigationNotes?: string;
}

export interface RiskSummaryDto {
  projectId: number;
  totalRisks: number;
  criticalRisks: number;
  highRisks: number;
  mitigatedRisks: number;
  averageRiskScore: number;
}
