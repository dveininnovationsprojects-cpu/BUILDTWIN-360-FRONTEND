// src/api/qualityApi.ts
import { http } from './client';
import {
  QualityIssue,
  CreateProjectIssueDto,
  AssignProjectIssueDto,
  ResolveProjectIssueDto,
  VerifyProjectIssueDto,
  ProjectIssueResponseDto,
  IssueBlocker,
  ProjectRisk,
} from './types';

export const qualityApi = {
  // Quality & Snags / NCRs (/api/v1/quality)
  createQualityIssue: (dto: Partial<QualityIssue>) =>
    http.post<QualityIssue>('/quality/issues', dto),
  getQualityIssuesByProject: (projectId: number, filters?: Record<string, any>) =>
    http.get<QualityIssue[]>(`/quality/issues/project/${projectId}`, filters),
  resolveQualityIssue: (id: number, rectificationNotes: string, rectifiedBy: string) =>
    http.post<QualityIssue>(`/quality/issues/${id}/resolve`, { rectificationNotes, rectifiedBy }),
  verifyQualityIssue: (id: number, approved: boolean, verifiedBy: string, verificationNotes?: string) =>
    http.post<QualityIssue>(`/quality/issues/${id}/verify`, { approved, verifiedBy, verificationNotes }),
  getQualitySummary: (projectId: number) =>
    http.get<any>(`/quality/summary/project/${projectId}`),

  // 5-Step Master Issue Lifecycle (/api/v1/project-issues)
  step1_LogTicket: (dto: CreateProjectIssueDto) =>
    http.post<ProjectIssueResponseDto>('/project-issues', dto),
  step2_AssignSla: (id: number, dto: AssignProjectIssueDto) =>
    http.patch<ProjectIssueResponseDto>(`/project-issues/${id}/assign`, dto),
  step3A_StartProgress: (id: number) =>
    http.patch<ProjectIssueResponseDto>(`/project-issues/${id}/start-progress`),
  step3B_ResolveWithProof: (id: number, dto: ResolveProjectIssueDto) =>
    http.patch<ProjectIssueResponseDto>(`/project-issues/${id}/resolve`, dto),
  step4_AuditVerification: (id: number, dto: VerifyProjectIssueDto) =>
    http.patch<ProjectIssueResponseDto>(`/project-issues/${id}/verify`, dto),
  getProjectIssueById: (id: number) =>
    http.get<ProjectIssueResponseDto>(`/project-issues/${id}`),
  getProjectIssues: (projectId: number, filters?: Record<string, any>) =>
    http.get<ProjectIssueResponseDto[]>(`/project-issues/project/${projectId}`, filters),
  step5A_GetOverdueIssues: (projectId: number) =>
    http.get<ProjectIssueResponseDto[]>(`/project-issues/overdue/project/${projectId}`),
  step5B_GetIssueSummary: (projectId: number) =>
    http.get<any>(`/project-issues/summary/project/${projectId}`),

  // Site Blockers & Risks (/api/v1/issues)
  createBlocker: (dto: Partial<IssueBlocker>) =>
    http.post<IssueBlocker>('/issues', dto),
  getActiveBlockers: (projectId?: number) =>
    http.get<IssueBlocker[]>(projectId ? `/issues/blockers/project/${projectId}` : '/issues/blockers'),
  resolveBlocker: (id: number, resolutionNotes?: string) =>
    http.post<IssueBlocker>(`/issues/${id}/resolve`, { resolutionNotes }),
  createRisk: (dto: Partial<ProjectRisk>) =>
    http.post<ProjectRisk>('/issues/risks', dto),
  getRisksByProject: (projectId: number) =>
    http.get<ProjectRisk[]>(`/issues/risks/project/${projectId}`),
  updateRiskStatus: (id: number, status: string, mitigationNotes?: string) =>
    http.patch<ProjectRisk>(`/issues/risks/${id}/status`, { status, mitigationNotes }),
};
