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

export const qualityApi = {
  // Query Quality Issues
  list: async (params = {}) => {
    const projectId = params.projectId ?? 1;
    const cleanParams = {};
    if (params.status && params.status !== 'ALL') cleanParams.status = params.status;
    if (params.severity && params.severity !== 'ALL') cleanParams.severity = params.severity;
    if (params.issueType && params.issueType !== 'ALL') cleanParams.issueType = params.issueType;
    const res = await apiClient.get(`/quality/issues/project/${projectId}`, { params: cleanParams });
    return unwrapList(res);
  },

  getAll: async (filters = {}) => {
    const res = await apiClient.get('/quality/issues', { params: filters });
    return unwrapList(res);
  },

  getById: async (id) => {
    const res = await apiClient.get(`/quality/issues/${id}`);
    return unwrap(res);
  },

  create: async (payload) => {
    const res = await apiClient.post('/quality/issues', payload);
    return unwrap(res);
  },

  update: async (id, payload) => {
    if (payload.status) {
      const res = await apiClient.patch(`/quality/issues/${id}/status`, null, { params: { status: payload.status } });
      return unwrap(res);
    }
    const res = await apiClient.put(`/quality/issues/${id}`, payload);
    return unwrap(res);
  },

  resolve: async (id, resolutionDto) => {
    const payload = {
      resolutionNotes: resolutionDto.resolutionNotes || resolutionDto.rectificationNotes || '',
      resolvedBy: resolutionDto.resolvedBy || resolutionDto.rectifiedBy || 'Site Engineer',
      rectificationPhotoUrl: resolutionDto.rectificationPhotoUrl || null,
    };
    const res = await apiClient.post(`/quality/issues/${id}/resolve`, payload);
    return unwrap(res);
  },

  verify: async (id, verificationDto) => {
    const payload = {
      approved: Boolean(verificationDto.approved),
      verifiedBy: verificationDto.verifiedBy || 'QA Lead',
      remarks: verificationDto.remarks || verificationDto.verificationNotes || 'Quality verification inspection completed',
    };
    const res = await apiClient.post(`/quality/issues/${id}/verify`, payload);
    return unwrap(res);
  },

  delete: async (id) => {
    await apiClient.delete(`/quality/issues/${id}`);
    return true;
  },

  addEvidence: async (evidence) => {
    const res = await apiClient.post('/quality/evidence', evidence);
    return unwrap(res);
  },

  getEvidence: async (id) => {
    const res = await apiClient.get(`/quality/issues/${id}/evidence`);
    return unwrapList(res);
  },

  getSummary: async (projectId = 1) => {
    const res = await apiClient.get(`/quality/summary/project/${projectId}`);
    return unwrap(res);
  },

  getOverdue: async (projectId = 1) => {
    const res = await apiClient.get(`/quality/issues/overdue/project/${projectId}`);
    return unwrapList(res);
  },
};

export { qualityIssueService };
