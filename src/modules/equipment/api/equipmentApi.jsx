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
 * Enterprise Equipment & Machinery API client
 * Connects directly to Spring Boot backend: /api/v1/equipment
 * Implements FR-100 (Asset Register), FR-101 (Site Allocation), FR-102 (Downtime & Usage Tracking)
 */
export const equipmentApi = {
  // Asset Directory Endpoints
  list: async () => {
    try {
      const res = await apiClient.get('/equipment');
      return unwrapList(res);
    } catch (err) {
      console.warn('Falling back for equipment directory:', err?.message);
      return [];
    }
  },

  getById: async (id) => {
    const res = await apiClient.get(`/equipment/${id}`);
    return unwrap(res);
  },

  create: async (payload) => {
    const res = await apiClient.post('/equipment', {
      assetCode: payload.assetCode?.trim(),
      name: payload.name?.trim() || payload.type || 'Equipment Asset',
      type: payload.type || 'OTHER',
      status: payload.status || 'AVAILABLE',
    });
    return unwrap(res);
  },

  update: async (id, payload) => {
    let assetCode = payload.assetCode?.trim();
    let name = payload.name?.trim();
    let type = payload.type;
    let status = payload.status;

    // If partial update (e.g. status toggle), resolve existing entity fields to satisfy @NotBlank backend validation
    if (!assetCode || !name) {
      try {
        const existing = await equipmentApi.getById(id);
        if (existing) {
          assetCode = assetCode || existing.assetCode;
          name = name || existing.name;
          type = type || existing.type;
          status = status || existing.status;
        }
      } catch (err) {
        console.warn('Failed to prefetch equipment for partial update:', err);
      }
    }

    const res = await apiClient.put(`/equipment/${id}`, {
      assetCode: assetCode || `EQ-${id}`,
      name: name || 'Equipment Asset',
      type: type || 'OTHER',
      status: status || 'AVAILABLE',
    });
    return unwrap(res);
  },

  delete: async (id) => {
    await apiClient.delete(`/equipment/${id}`);
    return true;
  },

  // Daily Usage & Downtime Endpoints (FR-101, FR-102)
  getUsageByProject: async (projectId = 1) => {
    try {
      const res = await apiClient.get(`/equipment/usage/project/${projectId}`);
      return unwrapList(res);
    } catch (err) {
      console.warn('Falling back for equipment usage logs:', err?.message);
      return [];
    }
  },

  getUsageById: async (id) => {
    const res = await apiClient.get(`/equipment/usage/${id}`);
    return unwrap(res);
  },

  recordUsage: async (payload) => {
    const res = await apiClient.post('/equipment/usage', {
      equipmentId: Number(payload.equipmentId),
      projectId: Number(payload.projectId || 1),
      usageDate: payload.usageDate || new Date().toISOString().split('T')[0],
      activityId: payload.activityId ? Number(payload.activityId) : null,
      hoursUsed: Number(payload.hoursUsed ?? 0),
      downtimeHours: Number(payload.downtimeHours ?? 0),
    });
    return unwrap(res);
  },

  deleteUsage: async (id) => {
    await apiClient.delete(`/equipment/usage/${id}`);
    return true;
  },
};
