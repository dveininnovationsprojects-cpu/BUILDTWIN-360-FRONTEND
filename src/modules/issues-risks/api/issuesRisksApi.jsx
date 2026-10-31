import { apiClient } from '@/lib/apiClient';
import { qualityIssueService } from '@/services/qualityIssueService';

function unwrap(response) {
  const body = response?.data;
  return body?.data !== undefined ? body.data : body;
}

function unwrapList(response) {
  const data = unwrap(response);
  return Array.isArray(data) ? data : [];
}

export const issuesRisksApi = {
  // Step 1: Identify & Log Defect / Issue (Capture Phase)
  createIssue: async (payload) => {
    const res = await apiClient.post('/project-issues', payload);
    return unwrap(res);
  },

  // Step 2: Assign Contractor & Set SLA (Allocation Phase)
  assignIssue: async (id, payload) => {
    const res = await apiClient.patch(`/project-issues/${id}/assign`, payload);
    return unwrap(res);
  },

  // Step 3A: Contractor Starts Work (Action Phase)
  startProgress: async (id) => {
    const res = await apiClient.patch(`/project-issues/${id}/start-progress`);
    return unwrap(res);
  },

  // Step 3B: Contractor Submits Resolution Proof (Rectification Phase)
  resolveIssue: async (id, payload) => {
    const res = await apiClient.patch(`/project-issues/${id}/resolve`, payload);
    return unwrap(res);
  },

  // Step 4: Quality Audit Verification (Pass -> CLOSED, Fail -> Reverts to OPEN)
  verifyIssue: async (id, payload) => {
    const res = await apiClient.patch(`/project-issues/${id}/verify`, payload);
    return unwrap(res);
  },

  // Get Issue Details by ID
  getIssueById: async (id) => {
    const res = await apiClient.get(`/project-issues/${id}`);
    return unwrap(res);
  },

  // Step 5: Queries & Filters
  getIssuesByProject: async (projectId = 1, filters = {}) => {
    const cleanParams = {};
    if (filters.type && filters.type !== 'ALL') cleanParams.type = filters.type;
    if (filters.status && filters.status !== 'ALL') cleanParams.status = filters.status;
    if (filters.severity && filters.severity !== 'ALL') cleanParams.severity = filters.severity;
    
    const res = await apiClient.get(`/project-issues/project/${projectId}`, { params: cleanParams });
    return unwrapList(res);
  },

  // Step 5A: Executive Overdue SLA Red Alerts
  getOverdueIssues: async (projectId = 1) => {
    const res = await apiClient.get(`/project-issues/overdue/project/${projectId}`);
    return unwrapList(res);
  },

  // Step 5B: KPI Analytics Summary
  getIssueSummary: async (projectId = 1) => {
    const res = await apiClient.get(`/project-issues/summary/project/${projectId}`);
    return unwrap(res);
  },

  // Part C: Site Blockers & Impact Areas (/api/v1/issues)
  createBlocker: async (payload) => {
    const res = await apiClient.post('/issues', payload);
    return unwrap(res);
  },

  getBlockers: async (projectId = 1) => {
    const res = await apiClient.get(`/issues/blockers/project/${projectId}`);
    return unwrapList(res);
  },

  resolveBlocker: async (id, resolutionNotes) => {
    const payload = resolutionNotes ? { resolutionNotes } : {};
    const res = await apiClient.post(`/issues/${id}/resolve`, payload);
    return unwrap(res);
  },

  getBlockerSummary: async (projectId = 1) => {
    const res = await apiClient.get(`/issues/summary/project/${projectId}`);
    return unwrap(res);
  },

  getOverdueBlockers: async (projectId = 1) => {
    const res = await apiClient.get(`/issues/overdue/project/${projectId}`);
    return unwrapList(res);
  },

  // Project Risks (/api/v1/issues/risks)
  createRisk: async (payload) => {
    const res = await apiClient.post('/issues/risks', payload);
    return unwrap(res);
  },

  updateRiskStatus: async (id, statusDto) => {
    const res = await apiClient.patch(`/issues/risks/${id}/status`, statusDto);
    return unwrap(res);
  },

  getRisks: async (projectId = 1, filters = {}) => {
    const res = await apiClient.get(`/issues/risks/project/${projectId}`, { params: filters });
    return unwrapList(res);
  },

  getRiskSummary: async (projectId = 1) => {
    const res = await apiClient.get(`/issues/risks/summary/project/${projectId}`);
    return unwrap(res);
  },

  deleteRisk: async (id) => {
    await apiClient.delete(`/issues/risks/${id}`);
    return true;
  },

  // Backward-compatible aliases
  list: async (params = {}) => {
    const projectId = params.projectId || 1;
    return issuesRisksApi.getIssuesByProject(projectId, params);
  },
  create: async (payload) => issuesRisksApi.createIssue(payload),
  update: async (id, payload) => issuesRisksApi.resolveIssue(id, payload),
};

export { qualityIssueService };

export const ISSUE_TYPES = [
  { value: 'SNAG', label: 'Snag / Defect', description: 'Minor finishing defect or cosmetic snag' },
  { value: 'NCR', label: 'NCR (Non-Conformance)', description: 'Structural or specification non-conformance' },
  { value: 'ISSUE', label: 'Site Issue', description: 'General operational or logistical site hurdle' },
  { value: 'RISK', label: 'Project Risk', description: 'Identified risk that may affect schedule or cost' },
  { value: 'BLOCKER', label: 'Work Blocker', description: 'Critical work-stopping blocker on site' },
];

export const ISSUE_SEVERITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
export const ISSUE_STATUSES = ['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];

export const getSeverityBadge = (severity) => {
  switch (severity) {
    case 'CRITICAL':
      return 'bg-red-500/20 text-red-600 border border-red-500/40 font-bold animate-pulse';
    case 'HIGH':
      return 'bg-orange-500/20 text-orange-600 border border-orange-500/40 font-semibold';
    case 'MEDIUM':
      return 'bg-yellow-500/20 text-yellow-700 border border-yellow-500/40';
    case 'LOW':
    default:
      return 'bg-green-500/20 text-green-700 border border-green-500/40';
  }
};

export const getStatusBadge = (status) => {
  switch (status) {
    case 'OPEN':
      return 'bg-red-500/15 text-red-600 font-semibold border border-red-200';
    case 'ASSIGNED':
      return 'bg-blue-500/15 text-blue-600 font-semibold border border-blue-200';
    case 'IN_PROGRESS':
      return 'bg-purple-500/15 text-purple-600 font-semibold border border-purple-200';
    case 'RESOLVED':
      return 'bg-amber-500/15 text-amber-600 font-semibold border border-amber-200';
    case 'CLOSED':
      return 'bg-emerald-500/15 text-emerald-700 font-bold border border-emerald-300';
    default:
      return 'bg-slate-500/15 text-slate-600';
  }
};
