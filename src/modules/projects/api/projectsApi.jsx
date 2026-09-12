import { apiClient } from '@/lib/apiClient';
import { useProjectsStore } from '../store/projectsStore';

// Normalizers for Project entity
const fromBackendProject = (project) => {
  if (!project) return null;
  return {
    ...project,
    type: project.projectType ?? project.type,
    client: project.clientName ?? project.client,
    startDate: project.plannedStartDate ?? project.startDate,
    endDate: project.plannedEndDate ?? project.endDate,
    status: project.status,
  };
};

const toBackendProject = (project) => ({
  name: project.name,
  code: project.code,
  description: project.description || '',
  clientName: project.clientName ?? project.client,
  projectType: project.projectType ?? project.type,
  location: project.location || '',
  status: project.status || 'PLANNED',
  plannedStartDate: project.plannedStartDate ?? project.startDate,
  plannedEndDate: (project.plannedEndDate ?? project.endDate) || null,
  actualStartDate: project.actualStartDate || null,
  estimatedBudget: project.estimatedBudget ? Number(project.estimatedBudget) : null,
  currency: project.currency || 'INR',
  totalBuiltUpAreaSqFt: project.totalBuiltUpAreaSqFt ? Number(project.totalBuiltUpAreaSqFt) : null,
  projectManagerId: project.projectManagerId ? Number(project.projectManagerId) : null,
});

// ==========================================
// 1. Projects API (Postman: 1, 3, 8, 9, 10, update, delete)
// ==========================================
export const projectsApi = {
  // GET /api/v1/projects/metrics (Tot Project Metrics)
  getMetrics: () =>
    apiClient
      .get('/projects/metrics')
      .then((r) => r.data)
      .catch(() => useProjectsStore.getState().getDemoMetrics()),

  // GET /api/v1/projects (All Projects with search, filter, pagination)
  list: (params) =>
    apiClient
      .get('/projects', { params })
      .then((r) => {
        const raw = r.data;
        const items = Array.isArray(raw) ? raw : raw?.content ?? [];
        return items.map(fromBackendProject);
      })
      .catch(() => useProjectsStore.getState().listDemoProjects(params).map(fromBackendProject)),

  // GET /api/v1/projects/{id} (Get Specific Project Detailed)
  getById: (id) =>
    apiClient
      .get(`/projects/${id}`)
      .then((r) => fromBackendProject(r.data))
      .catch(() => fromBackendProject(useProjectsStore.getState().getDemoProject(id))),

  // GET /api/v1/projects/code/{code}
  getByCode: (code) =>
    apiClient
      .get(`/projects/code/${encodeURIComponent(code)}`)
      .then((r) => fromBackendProject(r.data)),

  // POST /api/v1/projects (Create Project)
  create: (payload) =>
    apiClient
      .post('/projects', toBackendProject(payload))
      .then((r) => fromBackendProject(r.data))
      .catch(() => fromBackendProject(useProjectsStore.getState().createDemoProject(payload))),

  // PUT /api/v1/projects/{id} (Update Project)
  update: (id, payload) =>
    apiClient
      .put(`/projects/${id}`, toBackendProject(payload))
      .then((r) => fromBackendProject(r.data))
      .catch(() => fromBackendProject(useProjectsStore.getState().updateDemoProject(id, payload))),

  // PATCH /api/v1/projects/{id}/status (Update Status)
  updateStatus: (id, status) =>
    apiClient
      .patch(`/projects/${id}/status`, { status })
      .then((r) => fromBackendProject(r.data))
      .catch(() => fromBackendProject(useProjectsStore.getState().updateDemoProjectStatus(id, status))),

  // DELETE /api/v1/projects/{id}
  delete: (id) =>
    apiClient
      .delete(`/projects/${id}`)
      .then((r) => r.data)
      .catch(() => useProjectsStore.getState().deleteDemoProject(id)),
};

// ==========================================
// 2. Sites API (Postman: 2, 4, 5, 6, 7)
// ==========================================
export const sitesApi = {
  // GET /api/v1/projects/{projectId}/sites (Get Project Sites)
  listByProject: (projectId) =>
    apiClient
      .get(`/projects/${projectId}/sites`)
      .then((r) => (Array.isArray(r.data) ? r.data : r.data?.content ?? []))
      .catch(() => useProjectsStore.getState().listDemoSites(projectId)),

  // GET /api/v1/sites/{id} (Get Site)
  getById: (id) =>
    apiClient
      .get(`/sites/${id}`)
      .then((r) => r.data)
      .catch(() => useProjectsStore.getState().getDemoSite(id)),

  // POST /api/v1/projects/{projectId}/sites (Add Sites)
  create: (projectId, payload) =>
    apiClient
      .post(`/projects/${projectId}/sites`, {
        code: payload.code,
        name: payload.name,
        siteType: payload.siteType || 'BUILDING_TOWER',
        location: payload.location || '',
        status: payload.status || 'ACTIVE',
        latitude: payload.latitude ? Number(payload.latitude) : null,
        longitude: payload.longitude ? Number(payload.longitude) : null,
        areaSqFt: payload.areaSqFt ? Number(payload.areaSqFt) : null,
        siteIncharge: payload.siteIncharge || '',
      })
      .then((r) => r.data)
      .catch(() => useProjectsStore.getState().createDemoSite(projectId, payload)),

  // PUT /api/v1/sites/{id}
  update: (id, payload) =>
    apiClient
      .put(`/sites/${id}`, {
        code: payload.code,
        name: payload.name,
        siteType: payload.siteType,
        location: payload.location,
        latitude: payload.latitude ? Number(payload.latitude) : null,
        longitude: payload.longitude ? Number(payload.longitude) : null,
        areaSqFt: payload.areaSqFt ? Number(payload.areaSqFt) : null,
        siteIncharge: payload.siteIncharge,
      })
      .then((r) => r.data)
      .catch(() => useProjectsStore.getState().updateDemoSite(id, payload)),

  // PATCH /api/v1/sites/{id}/status (Update Site Status / PATCH Site)
  updateStatus: (id, status) =>
    apiClient
      .patch(`/sites/${id}/status`, { status })
      .then((r) => r.data)
      .catch(() => useProjectsStore.getState().updateDemoSiteStatus(id, status)),

  // DELETE /api/v1/sites/{id} (Delete Site)
  delete: (id) =>
    apiClient
      .delete(`/sites/${id}`)
      .then((r) => r.data)
      .catch(() => useProjectsStore.getState().deleteDemoSite(id)),
};

// ==========================================
// 3. Buildings API (Postman: 11, 12, 13, 14, 15)
// ==========================================
export const buildingsApi = {
  // GET /api/v1/sites/{siteId}/buildings (Get buildings)
  listBySite: (siteId) =>
    apiClient
      .get(`/sites/${siteId}/buildings`)
      .then((r) => (Array.isArray(r.data) ? r.data : r.data?.content ?? []))
      .catch(() => useProjectsStore.getState().listDemoBuildings(siteId)),

  // GET /api/v1/buildings/{id}
  getById: (id) =>
    apiClient
      .get(`/buildings/${id}`)
      .then((r) => r.data)
      .catch(() => useProjectsStore.getState().getDemoBuilding(id)),

  // POST /api/v1/sites/{siteId}/buildings (Create Buildings)
  create: (siteId, payload) =>
    apiClient
      .post(`/sites/${siteId}/buildings`, {
        code: payload.code,
        name: payload.name,
        buildingType: payload.buildingType || 'RESIDENTIAL_TOWER',
        totalFloors: payload.totalFloors ? Number(payload.totalFloors) : null,
        totalBuiltUpAreaSqFt: payload.totalBuiltUpAreaSqFt ? Number(payload.totalBuiltUpAreaSqFt) : null,
        status: payload.status || 'UNDER_CONSTRUCTION',
        description: payload.description || '',
      })
      .then((r) => r.data)
      .catch(() => useProjectsStore.getState().createDemoBuilding(siteId, payload)),

  // PUT /api/v1/buildings/{id} (Update Building)
  update: (id, payload) =>
    apiClient
      .put(`/buildings/${id}`, {
        name: payload.name,
        buildingType: payload.buildingType,
        totalFloors: payload.totalFloors ? Number(payload.totalFloors) : null,
        totalBuiltUpAreaSqFt: payload.totalBuiltUpAreaSqFt ? Number(payload.totalBuiltUpAreaSqFt) : null,
        description: payload.description || '',
      })
      .then((r) => r.data)
      .catch(() => useProjectsStore.getState().updateDemoBuilding(id, payload)),

  // PATCH /api/v1/buildings/{id}/status (PATCH Building Status)
  updateStatus: (id, status) =>
    apiClient
      .patch(`/buildings/${id}/status`, { status })
      .then((r) => r.data)
      .catch(() => useProjectsStore.getState().updateDemoBuildingStatus(id, status)),

  // DELETE /api/v1/buildings/{id} (Delete Building)
  delete: (id) =>
    apiClient
      .delete(`/buildings/${id}`)
      .then((r) => r.data)
      .catch(() => useProjectsStore.getState().deleteDemoBuilding(id)),
};

// ==========================================
// 4. Floors API (Postman: 16, 17, 18, 19, 20)
// ==========================================
export const floorsApi = {
  // GET /api/v1/buildings/{buildingId}/floors (List Floors of Building)
  listByBuilding: (buildingId) =>
    apiClient
      .get(`/buildings/${buildingId}/floors`)
      .then((r) => (Array.isArray(r.data) ? r.data : r.data?.content ?? []))
      .catch(() => useProjectsStore.getState().listDemoFloors(buildingId)),

  // GET /api/v1/floors/{id} (Get Floor)
  getById: (id) =>
    apiClient
      .get(`/floors/${id}`)
      .then((r) => r.data)
      .catch(() => useProjectsStore.getState().getDemoFloor(id)),

  // POST /api/v1/buildings/{buildingId}/floors (Create Floor)
  create: (buildingId, payload) =>
    apiClient
      .post(`/buildings/${buildingId}/floors`, {
        floorNumber: Number(payload.floorNumber),
        floorName: payload.floorName,
        floorType: payload.floorType || 'TYPICAL',
        builtUpAreaSqFt: payload.builtUpAreaSqFt ? Number(payload.builtUpAreaSqFt) : null,
        status: payload.status || 'IN_PROGRESS',
      })
      .then((r) => r.data)
      .catch(() => useProjectsStore.getState().createDemoFloor(buildingId, payload)),

  // PUT /api/v1/floors/{id} (Update Floor)
  update: (id, payload) =>
    apiClient
      .put(`/floors/${id}`, {
        floorName: payload.floorName,
        floorType: payload.floorType,
        builtUpAreaSqFt: payload.builtUpAreaSqFt ? Number(payload.builtUpAreaSqFt) : null,
      })
      .then((r) => r.data)
      .catch(() => useProjectsStore.getState().updateDemoFloor(id, payload)),

  // PATCH /api/v1/floors/{id}/status (Change Floor Status)
  updateStatus: (id, status) =>
    apiClient
      .patch(`/floors/${id}/status`, { status })
      .then((r) => r.data)
      .catch(() => useProjectsStore.getState().updateDemoFloorStatus(id, status)),

  // DELETE /api/v1/floors/{id} (Delete Floor)
  delete: (id) =>
    apiClient
      .delete(`/floors/${id}`)
      .then((r) => r.data)
      .catch(() => useProjectsStore.getState().deleteDemoFloor(id)),
};

// ==========================================
// 5. Zones API (Postman: 21, 22, 23, 24)
// ==========================================
export const zonesApi = {
  // GET /api/v1/floors/{floorId}/zones (List all zones of floor)
  listByFloor: (floorId) =>
    apiClient
      .get(`/floors/${floorId}/zones`)
      .then((r) => (Array.isArray(r.data) ? r.data : r.data?.content ?? []))
      .catch(() => useProjectsStore.getState().listDemoZones(floorId)),

  // GET /api/v1/zones/{id}
  getById: (id) =>
    apiClient
      .get(`/zones/${id}`)
      .then((r) => r.data)
      .catch(() => useProjectsStore.getState().getDemoZone(id)),

  // POST /api/v1/floors/{floorId}/zones (Create Zone)
  create: (floorId, payload) =>
    apiClient
      .post(`/floors/${floorId}/zones`, {
        code: payload.code,
        name: payload.name,
        zoneType: payload.zoneType || 'RESIDENTIAL_UNIT',
        areaSqFt: payload.areaSqFt ? Number(payload.areaSqFt) : null,
        status: payload.status || 'IN_PROGRESS',
      })
      .then((r) => r.data)
      .catch(() => useProjectsStore.getState().createDemoZone(floorId, payload)),

  // PUT /api/v1/zones/{id} (Update Zone)
  update: (id, payload) =>
    apiClient
      .put(`/zones/${id}`, {
        name: payload.name,
        zoneType: payload.zoneType,
        areaSqFt: payload.areaSqFt ? Number(payload.areaSqFt) : null,
      })
      .then((r) => r.data)
      .catch(() => useProjectsStore.getState().updateDemoZone(id, payload)),

  // PATCH /api/v1/zones/{id}/status (Zone Status)
  updateStatus: (id, status) =>
    apiClient
      .patch(`/zones/${id}/status`, { status })
      .then((r) => r.data)
      .catch(() => useProjectsStore.getState().updateDemoZoneStatus(id, status)),

  // DELETE /api/v1/zones/{id} (Delete Zone)
  delete: (id) =>
    apiClient
      .delete(`/zones/${id}`)
      .then((r) => r.data)
      .catch(() => useProjectsStore.getState().deleteDemoZone(id)),
};

// ==========================================
// 6. Hierarchy API (Postman: 25, 26)
// ==========================================
export const hierarchyApi = {
  // GET /api/v1/hierarchy/tree/{projectId} (Get Hierarchy Tree)
  getTree: (projectId) =>
    apiClient
      .get(`/hierarchy/tree/${projectId}`)
      .then((r) => r.data)
      .catch(() => useProjectsStore.getState().getDemoHierarchyTree(projectId)),

  // GET /api/v1/hierarchy/validate (Hierarchy Validation)
  validate: (params) =>
    apiClient
      .get('/hierarchy/validate', { params })
      .then((r) => r.data)
      .catch(() =>
        useProjectsStore
          .getState()
          .validateDemoHierarchy(
            params.projectId,
            params.siteId,
            params.buildingId,
            params.floorId,
            params.zoneId,
          ),
      ),
};
