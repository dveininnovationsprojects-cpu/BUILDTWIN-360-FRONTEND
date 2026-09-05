import { apiClient } from '@/lib/apiClient';
import { useProjectsStore } from '../store/projectsStore';

const MOCK_PROJECTS = [
  { id: 'prj-001', code: 'PRJ-001', name: 'Padur Independent Residence', type: 'RESIDENTIAL', client: 'Ashok Builders & Developers', location: 'Padur, OMR, Chennai', status: 'IN_PROGRESS' },
  { id: 'prj-002', code: 'PRJ-002', name: 'OMR Commercial Block', type: 'COMMERCIAL', client: 'OMR Realty Infra', location: 'Sholinganallur, Chennai', status: 'IN_PROGRESS' },
  { id: 'prj-003', code: 'PRJ-003', name: 'ECR Luxury Apartments', type: 'INFRASTRUCTURE', client: 'ECR Coast Properties', location: 'Kovalam, Chennai', status: 'PLANNING' },
];


// Maps to /projects (spec section 14 - API Requirements).
//
// Each call falls back to the local demo-project store when the backend at
// VITE_API_BASE_URL isn't reachable, the same way identityApi already falls
// back to demoAccounts — so Projects stays usable in local/demo mode instead
// of surfacing a raw "Request failed with status code 500". Once a real
// backend is live this fallback only triggers on its actual failures.
export const projectsApi = {
  list: (params) =>
    apiClient.get('/projects', { params }).then((r) => r.data)
      .catch(() => useProjectsStore.getState().listDemoProjects()),

  getById: (id) =>
    apiClient.get(`/projects/${id}`).then((r) => r.data)
      .catch(() => useProjectsStore.getState().getDemoProject(id)),

  create: (payload) =>
    apiClient.post('/projects', payload).then((r) => r.data)
      .catch(() => useProjectsStore.getState().createDemoProject(payload)),

  update: (id, payload) =>
    apiClient.put(`/projects/${id}`, payload).then((r) => r.data)
      .catch(() => useProjectsStore.getState().updateDemoProject(id, payload)),
};
