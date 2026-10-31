// src/services/qualityIssueService.ts
import apiClient from '../api/client';
import {
  QualityIssue,
  QualityResolutionDto,
  QualityVerificationDto,
  QualityEvidence,
  QualitySummaryDto,
  CreateProjectIssueDto,
  AssignProjectIssueDto,
  ResolveProjectIssueDto,
  VerifyProjectIssueDto,
  ProjectIssueResponseDto,
  ProjectIssueSummaryDto,
  IssueBlocker,
  ProjectRisk,
  RiskStatusUpdateDto,
  RiskSummaryDto,
  IssueType,
  IssueStatus,
  IssueSeverity,
} from '../types/qualityAndIssues';

export const qualityIssueService = {
  // ============================================================
  // Part A: Quality & Snag / NCR Workflow (/api/v1/quality)
  // ============================================================
  async createQualityIssue(payload: Partial<QualityIssue>): Promise<QualityIssue> {
    return apiClient.post('/quality/issues', payload);
  },

  async updateQualityIssue(id: number, payload: Partial<QualityIssue>): Promise<QualityIssue> {
    return apiClient.put(`/quality/issues/${id}`, payload);
  },

  async getAllQualityIssues(filters?: { projectId?: number; status?: string; severity?: string; issueType?: string }): Promise<QualityIssue[]> {
    return apiClient.get('/quality/issues', { params: filters });
  },

  async getQualityIssueById(id: number): Promise<QualityIssue> {
    return apiClient.get(`/quality/issues/${id}`);
  },

  async getQualityIssuesByProject(projectId: number, filters?: { status?: string; severity?: string; issueType?: string }): Promise<QualityIssue[]> {
    return apiClient.get(`/quality/issues/project/${projectId}`, { params: filters });
  },

  async updateQualityStatus(id: number, status: string): Promise<QualityIssue> {
    return apiClient.patch(`/quality/issues/${id}/status`, null, { params: { status } });
  },

  async resolveQualityIssue(id: number, dto: QualityResolutionDto): Promise<QualityIssue> {
    const payload = {
      resolutionNotes: dto.resolutionNotes || dto.rectificationNotes,
      resolvedBy: dto.resolvedBy || dto.rectifiedBy,
      rectificationPhotoUrl: dto.rectificationPhotoUrl,
    };
    return apiClient.post(`/quality/issues/${id}/resolve`, payload);
  },

  async verifyQualityIssue(id: number, dto: QualityVerificationDto): Promise<QualityIssue> {
    const payload = {
      approved: dto.approved,
      verifiedBy: dto.verifiedBy,
      remarks: dto.remarks || dto.verificationNotes || 'Inspection verification completed',
    };
    return apiClient.post(`/quality/issues/${id}/verify`, payload);
  },

  async deleteQualityIssue(id: number): Promise<void> {
    return apiClient.delete(`/quality/issues/${id}`);
  },

  async addQualityEvidence(evidence: QualityEvidence): Promise<QualityEvidence> {
    return apiClient.post('/quality/evidence', evidence);
  },

  async getQualityEvidence(qualityIssueId: number): Promise<QualityEvidence[]> {
    return apiClient.get(`/quality/issues/${qualityIssueId}/evidence`);
  },

  async getQualitySummary(projectId: number): Promise<QualitySummaryDto> {
    return apiClient.get(`/quality/summary/project/${projectId}`);
  },

  async getOverdueQualityIssues(projectId: number): Promise<QualityIssue[]> {
    return apiClient.get(`/quality/issues/overdue/project/${projectId}`);
  },

  // ============================================================
  // Part B: 5-Step Master Issue Lifecycle (/api/v1/project-issues)
  // ============================================================
  // Step 1: Capture Phase
  async logMasterIssue(dto: CreateProjectIssueDto): Promise<ProjectIssueResponseDto> {
    return apiClient.post('/project-issues', dto);
  },

  // Step 2: Allocation & SLA Phase
  async assignMasterIssue(id: number, dto: AssignProjectIssueDto): Promise<ProjectIssueResponseDto> {
    return apiClient.patch(`/project-issues/${id}/assign`, dto);
  },

  // Step 3A: Contractor Starts Progress
  async startMasterIssueProgress(id: number): Promise<ProjectIssueResponseDto> {
    return apiClient.patch(`/project-issues/${id}/start-progress`);
  },

  // Step 3B: Contractor Rectification Submission with Photo Proof
  async resolveMasterIssue(id: number, dto: ResolveProjectIssueDto): Promise<ProjectIssueResponseDto> {
    return apiClient.patch(`/project-issues/${id}/resolve`, dto);
  },

  // Step 4: Quality Auditor Verification (Pass -> CLOSED, Fail -> Reverts to OPEN)
  async verifyMasterIssue(id: number, dto: VerifyProjectIssueDto): Promise<ProjectIssueResponseDto> {
    return apiClient.patch(`/project-issues/${id}/verify`, dto);
  },

  async getMasterIssueById(id: number): Promise<ProjectIssueResponseDto> {
    return apiClient.get(`/project-issues/${id}`);
  },

  async getMasterIssuesByProject(
    projectId: number,
    filters?: { type?: IssueType; status?: IssueStatus; severity?: IssueSeverity }
  ): Promise<ProjectIssueResponseDto[]> {
    return apiClient.get(`/project-issues/project/${projectId}`, { params: filters });
  },

  // Step 5A: SLA Breach Overdue Red Alert List
  async getOverdueMasterIssues(projectId: number): Promise<ProjectIssueResponseDto[]> {
    return apiClient.get(`/project-issues/overdue/project/${projectId}`);
  },

  // Step 5B: Master Issue KPI Summary & Resolution Velocity
  async getMasterIssueSummary(projectId: number): Promise<ProjectIssueSummaryDto> {
    return apiClient.get(`/project-issues/summary/project/${projectId}`);
  },

  // ============================================================
  // ============================================================
  // Part C: Site Blocker & Issue Register (/api/v1/issues) [14 APIs]
  // ============================================================
  async createSiteBlocker(blocker: Partial<IssueBlocker>): Promise<IssueBlocker> {
    return apiClient.post('/issues', blocker);
  },

  async updateSiteBlocker(id: number, blocker: Partial<IssueBlocker>): Promise<IssueBlocker> {
    return apiClient.put(`/issues/${id}`, blocker);
  },

  async getAllIssues(filters?: { projectId?: number; issueType?: string; status?: string; severity?: string }): Promise<any[]> {
    return apiClient.get('/issues', { params: filters });
  },

  async getAllBlockers(projectId?: number): Promise<IssueBlocker[]> {
    const params = projectId ? { projectId } : {};
    return apiClient.get('/issues/blockers', { params });
  },

  async addIssueEvidence(evidence: { issueId: number; photoUrl: string; evidenceType?: string; uploadedBy?: string; caption?: string }): Promise<any> {
    return apiClient.post('/issues/evidence', evidence);
  },

  async getIssueEvidence(id: number): Promise<any[]> {
    return apiClient.get(`/issues/${id}/evidence`);
  },

  async getIssueById(id: number): Promise<any> {
    return apiClient.get(`/issues/${id}`);
  },

  async getIssuesByProject(projectId: number, filters?: Record<string, any>): Promise<any[]> {
    return apiClient.get(`/issues/project/${projectId}`, { params: filters });
  },

  async getBlockersByProject(projectId: number): Promise<IssueBlocker[]> {
    return apiClient.get(`/issues/blockers/project/${projectId}`);
  },

  async resolveBlocker(id: number, resolutionNotes?: string): Promise<IssueBlocker> {
    const payload = resolutionNotes ? { resolutionNotes } : {};
    return apiClient.post(`/issues/${id}/resolve`, payload);
  },

  async updateIssueStatus(id: number, status: string): Promise<any> {
    return apiClient.patch(`/issues/${id}/status`, null, { params: { status } });
  },

  async deleteIssue(id: number): Promise<void> {
    return apiClient.delete(`/issues/${id}`);
  },

  async getBlockerSummary(projectId: number): Promise<any> {
    return apiClient.get(`/issues/summary/project/${projectId}`);
  },

  async getOverdueBlockers(projectId: number): Promise<IssueBlocker[]> {
    return apiClient.get(`/issues/overdue/project/${projectId}`);
  },

  // ============================================================
  // Part D: Project Risk Register & Scoring (/api/v1/issues/risks) [8 APIs]
  // ============================================================
  async createProjectRisk(risk: Partial<ProjectRisk>): Promise<ProjectRisk> {
    return apiClient.post('/issues/risks', risk);
  },

  async updateProjectRisk(id: number, risk: Partial<ProjectRisk>): Promise<ProjectRisk> {
    return apiClient.put(`/issues/risks/${id}`, risk);
  },

  async updateRiskStatus(id: number, dto: RiskStatusUpdateDto): Promise<ProjectRisk> {
    return apiClient.patch(`/issues/risks/${id}/status`, dto);
  },

  async getAllRisks(filters?: { projectId?: number; status?: string; severity?: string }): Promise<ProjectRisk[]> {
    return apiClient.get('/issues/risks', { params: filters });
  },

  async getRiskById(id: number): Promise<ProjectRisk> {
    return apiClient.get(`/issues/risks/${id}`);
  },

  async getRisksByProject(projectId: number, status?: string, severity?: string): Promise<ProjectRisk[]> {
    return apiClient.get(`/issues/risks/project/${projectId}`, { params: { status, severity } });
  },

  async deleteProjectRisk(id: number): Promise<void> {
    return apiClient.delete(`/issues/risks/${id}`);
  },

  async getRiskSummary(projectId: number): Promise<RiskSummaryDto> {
    return apiClient.get(`/issues/risks/summary/project/${projectId}`);
  },
};
