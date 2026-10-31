import { apiClient } from '@/lib/apiClient';

function unwrap(response) {
  const body = response?.data;
  return body?.data !== undefined ? body.data : body;
}

function unwrapList(response) {
  const data = unwrap(response);
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  return [];
}

/**
 * Enterprise Document & Photo Repository API client
 * Connects directly to Spring Boot backend: /api/v1/documents
 * Implements FR-110 (Drawings & Approvals), FR-111 (Version Control), FR-113 (Category Filtering)
 */
export const documentsApi = {
  list: async (params = {}) => {
    try {
      const projectId = params.projectId || 1;
      const category = params.category;
      let url = `/documents/project/${projectId}`;
      if (category && category !== 'ALL') {
        url = `/documents/project/${projectId}/category/${encodeURIComponent(category)}`;
      }
      const res = await apiClient.get(url);
      return unwrapList(res);
    } catch (err) {
      console.warn('Falling back for documents list:', err?.message);
      return [];
    }
  },

  getById: async (id) => {
    const res = await apiClient.get(`/documents/${id}`);
    return unwrap(res);
  },

  create: async (payload) => {
    const res = await apiClient.post('/documents', {
      projectId: Number(payload.projectId || 1),
      title: payload.title?.trim() || payload.name?.trim() || 'Project Document',
      category: payload.category || 'DRAWING',
      version: payload.version?.trim() || 'v1.0',
      objectUrl: payload.objectUrl?.trim() || 'https://storage.buildtwin.local/documents/sample-doc.pdf',
      status: payload.status || 'ACTIVE',
      uploadedBy: payload.uploadedBy?.trim() || 'Site Engineer',
    });
    return unwrap(res);
  },

  delete: async (id) => {
    await apiClient.delete(`/documents/${id}`);
    return true;
  },
};
