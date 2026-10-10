import { apiClient } from '@/lib/apiClient';

const STORAGE_KEY = 'buildtwin_wbs_work_packages';

export function normalizeWorkPackage(item) {
  if (!item) return null;
  return {
    id: item.id != null ? String(item.id) : String(Date.now()),
    numericId: item.id != null ? Number(item.id) : null,
    projectId: item.projectId != null ? Number(item.projectId) : null,
    projectName: item.projectName || '',
    siteId: item.siteId != null ? Number(item.siteId) : null,
    siteName: item.siteName || '',
    code: item.code || item.wbsCode || '',
    wbsCode: item.code || item.wbsCode || '',
    name: item.name || '',
    discipline: (item.discipline || 'CIVIL').toUpperCase(),
    description: item.description || '',
    status: (item.status || 'PLANNED').toUpperCase(),
    plannedStartDate: item.plannedStartDate || item.startDate || '',
    plannedEndDate: item.plannedEndDate || item.endDate || '',
    actualStartDate: item.actualStartDate || '',
    actualEndDate: item.actualEndDate || '',
    startDate: item.plannedStartDate || item.startDate || '',
    endDate: item.plannedEndDate || item.endDate || '',
    budgetAmount: item.budgetAmount != null ? Number(item.budgetAmount) : 0,
    assignedContractor: item.assignedContractor || '',
    inchargeUserId: item.inchargeUserId != null ? Number(item.inchargeUserId) : null,
    inchargeUserName: item.inchargeUserName || '',
    createdAt: item.createdAt || '',
    updatedAt: item.updatedAt || '',
  };
}

function getStoredWorkPackages() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map(normalizeWorkPackage);
      }
    }
  } catch {
    // ignore
  }
  return [];
}

function saveStoredWorkPackages(items) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // ignore
  }
}

export const wbsScheduleApi = {
  // GET /api/v1/projects/{projectId}/work-packages
  list: async (projectId = 1, params = {}) => {
    try {
      const response = await apiClient.get(`/projects/${projectId}/work-packages`, {
        params: { size: 100, ...params },
      });
      if (response && response.data) {
        const payload = response.data.data !== undefined ? response.data.data : response.data;
        const items = Array.isArray(payload) ? payload : (payload?.content || []);
        if (Array.isArray(items)) {
          const normalized = items.map(normalizeWorkPackage);
          saveStoredWorkPackages(normalized);
          return normalized;
        }
      }
    } catch (err) {
      console.warn(`Backend /projects/${projectId}/work-packages fetch failed, fallback to local storage:`, err);
    }

    return getStoredWorkPackages();
  },

  // GET /api/v1/work-packages/{id}
  getById: async (id) => {
    try {
      const response = await apiClient.get(`/work-packages/${id}`);
      if (response && response.data) {
        const item = response.data.data !== undefined ? response.data.data : response.data;
        return normalizeWorkPackage(item);
      }
    } catch (err) {
      console.warn(`Backend /work-packages/${id} fetch failed:`, err);
    }
    const local = getStoredWorkPackages();
    return local.find((w) => String(w.id) === String(id)) || null;
  },

  // POST /api/v1/projects/{projectId}/work-packages
  create: async (projectId, payload) => {
    const targetProjectId = projectId || payload.projectId || 1;

    const requestBody = {
      siteId: payload.siteId ? Number(payload.siteId) : null,
      code: String(payload.code || payload.wbsCode || '').trim().toUpperCase(),
      name: String(payload.name || '').trim(),
      discipline: (payload.discipline || 'CIVIL').toUpperCase(),
      description: payload.description || '',
      status: (payload.status || 'PLANNED').toUpperCase(),
      plannedStartDate: payload.plannedStartDate || payload.startDate || null,
      plannedEndDate: payload.plannedEndDate || payload.endDate || null,
      actualStartDate: payload.actualStartDate || null,
      budgetAmount: payload.budgetAmount != null && payload.budgetAmount !== '' ? Number(payload.budgetAmount) : null,
      assignedContractor: payload.assignedContractor || null,
      inchargeUserId: payload.inchargeUserId ? Number(payload.inchargeUserId) : null,
    };

    try {
      const response = await apiClient.post(`/projects/${targetProjectId}/work-packages`, requestBody);
      if (response && response.data) {
        const item = response.data.data !== undefined ? response.data.data : response.data;
        return normalizeWorkPackage(item);
      }
    } catch (err) {
      console.error('API create work package failed:', err);
      const msg = err.response?.data?.message || err.message || 'Failed to create work package on server';
      throw new Error(msg);
    }
  },

  // PUT /api/v1/work-packages/{id}
  update: async (id, payload) => {
    const requestBody = {
      siteId: payload.siteId ? Number(payload.siteId) : null,
      code: String(payload.code || payload.wbsCode || '').trim().toUpperCase(),
      name: String(payload.name || '').trim(),
      discipline: (payload.discipline || 'CIVIL').toUpperCase(),
      description: payload.description || '',
      status: (payload.status || 'PLANNED').toUpperCase(),
      plannedStartDate: payload.plannedStartDate || payload.startDate || null,
      plannedEndDate: payload.plannedEndDate || payload.endDate || null,
      actualStartDate: payload.actualStartDate || null,
      actualEndDate: payload.actualEndDate || null,
      budgetAmount: payload.budgetAmount != null && payload.budgetAmount !== '' ? Number(payload.budgetAmount) : null,
      assignedContractor: payload.assignedContractor || null,
      inchargeUserId: payload.inchargeUserId ? Number(payload.inchargeUserId) : null,
    };

    try {
      const response = await apiClient.put(`/work-packages/${id}`, requestBody);
      if (response && response.data) {
        const item = response.data.data !== undefined ? response.data.data : response.data;
        return normalizeWorkPackage(item);
      }
    } catch (err) {
      console.error('API update work package failed:', err);
      const msg = err.response?.data?.message || err.message || 'Failed to update work package on server';
      throw new Error(msg);
    }
  },

  // PATCH /api/v1/work-packages/{id}/status
  updateStatus: async (id, status) => {
    try {
      const response = await apiClient.patch(`/work-packages/${id}/status`, {
        status: status.toUpperCase(),
      });
      if (response && response.data) {
        const item = response.data.data !== undefined ? response.data.data : response.data;
        return normalizeWorkPackage(item);
      }
    } catch (err) {
      console.error('API update work package status failed:', err);
      const msg = err.response?.data?.message || err.message || 'Failed to update status on server';
      throw new Error(msg);
    }
  },

  // DELETE /api/v1/work-packages/{id}
  delete: async (id) => {
    try {
      await apiClient.delete(`/work-packages/${id}`);
      return true;
    } catch (err) {
      console.error('API delete work package failed:', err);
      const msg = err.response?.data?.message || err.message || 'Failed to delete work package on server';
      throw new Error(msg);
    }
  },
};

// ==========================================
// WBS ACTIVITIES API (WbsActivityController)
// ==========================================
export const wbsActivitiesApi = {
  // GET /api/v1/work-packages/{workPackageId}/activities
  listByWorkPackage: async (workPackageId) => {
    try {
      const res = await apiClient.get(`/work-packages/${workPackageId}/activities`);
      const body = res.data?.data !== undefined ? res.data.data : res.data;
      return Array.isArray(body) ? body : (body?.content || []);
    } catch (err) {
      console.error(`Failed to list activities for work package ${workPackageId}:`, err);
      return [];
    }
  },

  // GET /api/v1/projects/{projectId}/wbs-activities
  listByProject: async (projectId = 1, params = {}) => {
    try {
      const res = await apiClient.get(`/projects/${projectId}/wbs-activities`, {
        params: { size: 100, ...params },
      });
      const body = res.data?.data !== undefined ? res.data.data : res.data;
      return Array.isArray(body) ? body : (body?.content || []);
    } catch (err) {
      console.error(`Failed to list activities for project ${projectId}:`, err);
      return [];
    }
  },

  // GET /api/v1/activities (Multi-criteria search)
  search: async (params = {}) => {
    try {
      const res = await apiClient.get('/activities', { params: { size: 100, ...params } });
      const body = res.data?.data !== undefined ? res.data.data : res.data;
      return Array.isArray(body) ? body : (body?.content || []);
    } catch (err) {
      console.error('Failed to search activities:', err);
      return [];
    }
  },

  // GET /api/v1/activities/{id}
  getById: async (id) => {
    const res = await apiClient.get(`/activities/${id}`);
    return res.data?.data !== undefined ? res.data.data : res.data;
  },

  // GET /api/v1/activities/{id}/tree
  getTree: async (id) => {
    const res = await apiClient.get(`/activities/${id}/tree`);
    return res.data?.data !== undefined ? res.data.data : res.data;
  },

  // POST /api/v1/work-packages/{workPackageId}/activities
  create: async (workPackageId, payload) => {
    try {
      const res = await apiClient.post(`/work-packages/${workPackageId}/activities`, payload);
      return res.data?.data !== undefined ? res.data.data : res.data;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to create activity';
      throw new Error(msg);
    }
  },

  // POST /api/v1/activities/{parentId}/children
  createChild: async (parentId, payload) => {
    try {
      const res = await apiClient.post(`/activities/${parentId}/children`, payload);
      return res.data?.data !== undefined ? res.data.data : res.data;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to create child activity';
      throw new Error(msg);
    }
  },

  // PUT /api/v1/activities/{id}
  update: async (id, payload) => {
    try {
      const res = await apiClient.put(`/activities/${id}`, payload);
      return res.data?.data !== undefined ? res.data.data : res.data;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to update activity';
      throw new Error(msg);
    }
  },

  // PATCH /api/v1/activities/{id}/progress
  updateProgress: async (id, payload) => {
    try {
      const res = await apiClient.patch(`/activities/${id}/progress`, payload);
      return res.data?.data !== undefined ? res.data.data : res.data;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to update activity progress';
      throw new Error(msg);
    }
  },

  // PATCH /api/v1/activities/{id}/status
  updateStatus: async (id, payload) => {
    try {
      const res = await apiClient.patch(`/activities/${id}/status`, payload);
      return res.data?.data !== undefined ? res.data.data : res.data;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to update activity status';
      throw new Error(msg);
    }
  },

  // PATCH /api/v1/activities/{id}/assign
  assign: async (id, payload) => {
    try {
      const res = await apiClient.patch(`/activities/${id}/assign`, payload);
      return res.data?.data !== undefined ? res.data.data : res.data;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to assign activity';
      throw new Error(msg);
    }
  },

  // PATCH /api/v1/activities/{id}/reparent
  reparent: async (id, payload) => {
    try {
      const res = await apiClient.patch(`/activities/${id}/reparent`, payload);
      return res.data?.data !== undefined ? res.data.data : res.data;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to reparent activity';
      throw new Error(msg);
    }
  },

  // DELETE /api/v1/activities/{id}
  delete: async (id) => {
    try {
      await apiClient.delete(`/activities/${id}`);
      return true;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to delete activity';
      throw new Error(msg);
    }
  },
};

// ================================================================
// ACTIVITY DEPENDENCY & CPM NETWORK API (ActivityDependencyController)
// ================================================================
export const activityDependenciesApi = {
  // GET /api/v1/projects/{projectId}/activity-dependencies
  listByProject: async (projectId = 1) => {
    try {
      const res = await apiClient.get(`/projects/${projectId}/activity-dependencies`);
      const body = res.data?.data !== undefined ? res.data.data : res.data;
      return Array.isArray(body) ? body : [];
    } catch (err) {
      console.error(`Failed to list dependencies for project ${projectId}:`, err);
      return [];
    }
  },

  // GET /api/v1/work-packages/{workPackageId}/activity-dependencies
  listByWorkPackage: async (workPackageId) => {
    try {
      const res = await apiClient.get(`/work-packages/${workPackageId}/activity-dependencies`);
      const body = res.data?.data !== undefined ? res.data.data : res.data;
      return Array.isArray(body) ? body : [];
    } catch (err) {
      console.error(`Failed to list dependencies for work package ${workPackageId}:`, err);
      return [];
    }
  },

  // GET /api/v1/activities/{activityId}/predecessors
  getPredecessors: async (activityId) => {
    try {
      const res = await apiClient.get(`/activities/${activityId}/predecessors`);
      const body = res.data?.data !== undefined ? res.data.data : res.data;
      return Array.isArray(body) ? body : [];
    } catch (err) {
      console.error(`Failed to get predecessors for activity ${activityId}:`, err);
      return [];
    }
  },

  // GET /api/v1/activities/{activityId}/successors
  getSuccessors: async (activityId) => {
    try {
      const res = await apiClient.get(`/activities/${activityId}/successors`);
      const body = res.data?.data !== undefined ? res.data.data : res.data;
      return Array.isArray(body) ? body : [];
    } catch (err) {
      console.error(`Failed to get successors for activity ${activityId}:`, err);
      return [];
    }
  },

  // GET /api/v1/activities/{activityId}/dependency-chain
  getDependencyChain: async (activityId) => {
    try {
      const res = await apiClient.get(`/activities/${activityId}/dependency-chain`);
      return res.data?.data !== undefined ? res.data.data : res.data;
    } catch (err) {
      console.error(`Failed to get dependency chain for activity ${activityId}:`, err);
      return null;
    }
  },

  // GET /api/v1/projects/{projectId}/activity-dependencies/network
  getProjectNetwork: async (projectId = 1) => {
    try {
      const res = await apiClient.get(`/projects/${projectId}/activity-dependencies/network`);
      return res.data?.data !== undefined ? res.data.data : res.data;
    } catch (err) {
      console.error(`Failed to get CPM network for project ${projectId}:`, err);
      return null;
    }
  },

  // POST /api/v1/activity-dependencies
  create: async (payload) => {
    try {
      const res = await apiClient.post('/activity-dependencies', payload);
      return res.data?.data !== undefined ? res.data.data : res.data;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to create precedence dependency';
      throw new Error(msg);
    }
  },

  // PUT /api/v1/activity-dependencies/{id}
  update: async (id, payload) => {
    try {
      const res = await apiClient.put(`/activity-dependencies/${id}`, payload);
      return res.data?.data !== undefined ? res.data.data : res.data;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to update precedence dependency';
      throw new Error(msg);
    }
  },

  // DELETE /api/v1/activity-dependencies/{id}
  delete: async (id) => {
    try {
      await apiClient.delete(`/activity-dependencies/${id}`);
      return true;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to delete precedence dependency';
      throw new Error(msg);
    }
  },

  // DELETE /api/v1/activities/{activityId}/dependencies
  deleteByActivity: async (activityId) => {
    try {
      await apiClient.delete(`/activities/${activityId}/dependencies`);
      return true;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to delete dependencies for activity';
      throw new Error(msg);
    }
  },
};

