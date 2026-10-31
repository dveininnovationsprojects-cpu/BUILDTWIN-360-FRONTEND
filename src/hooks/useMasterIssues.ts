// src/hooks/useMasterIssues.ts
import { useState, useEffect, useCallback } from 'react';
import { qualityIssueService } from '../services/qualityIssueService';
import {
  ProjectIssueResponseDto,
  ProjectIssueSummaryDto,
  CreateProjectIssueDto,
  AssignProjectIssueDto,
  ResolveProjectIssueDto,
  VerifyProjectIssueDto,
} from '../types/qualityAndIssues';

export function useMasterIssues(projectId: number) {
  const [issues, setIssues] = useState<ProjectIssueResponseDto[]>([]);
  const [overdues, setOverdues] = useState<ProjectIssueResponseDto[]>([]);
  const [summary, setSummary] = useState<ProjectIssueSummaryDto | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchIssues = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const [issueList, overdueList, summaryData] = await Promise.all([
        qualityIssueService.getMasterIssuesByProject(projectId).catch(() => []),
        qualityIssueService.getOverdueMasterIssues(projectId).catch(() => []),
        qualityIssueService.getMasterIssueSummary(projectId).catch(() => null),
      ]);
      setIssues(Array.isArray(issueList) ? issueList : []);
      setOverdues(Array.isArray(overdueList) ? overdueList : []);
      setSummary(summaryData);
    } catch (err) {
      console.error('Failed to load project issues', err);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchIssues();
  }, [fetchIssues]);

  // Step 1: Capture
  const logTicket = async (dto: CreateProjectIssueDto) => {
    const res = await qualityIssueService.logMasterIssue(dto);
    await fetchIssues();
    return res;
  };

  // Step 2: Assign SLA
  const assignTicket = async (id: number, dto: AssignProjectIssueDto) => {
    const res = await qualityIssueService.assignMasterIssue(id, dto);
    await fetchIssues();
    return res;
  };

  // Step 3A: Start Progress
  const startProgress = async (id: number) => {
    const res = await qualityIssueService.startMasterIssueProgress(id);
    await fetchIssues();
    return res;
  };

  // Step 3B: Contractor Fix
  const resolveTicket = async (id: number, dto: ResolveProjectIssueDto) => {
    const res = await qualityIssueService.resolveMasterIssue(id, dto);
    await fetchIssues();
    return res;
  };

  // Step 4: QA Verify Closure
  const verifyTicket = async (id: number, dto: VerifyProjectIssueDto) => {
    const res = await qualityIssueService.verifyMasterIssue(id, dto);
    await fetchIssues();
    return res;
  };

  return {
    issues,
    overdues,
    summary,
    loading,
    refresh: fetchIssues,
    logTicket,
    assignTicket,
    startProgress,
    resolveTicket,
    verifyTicket,
  };
}
