import { apiClient } from '@/lib/apiClient';

// ─── Material Request Status Enums ──────────────────────────────────────────
export const MATERIAL_REQUEST_STATUSES = [
  { value: 'PENDING', label: 'Pending Approval', color: 'bg-amber-50 text-amber-700 border-amber-300' },
  { value: 'APPROVED', label: 'Approved', color: 'bg-emerald-50 text-emerald-700 border-emerald-300' },
  { value: 'REJECTED', label: 'Rejected', color: 'bg-rose-50 text-rose-700 border-rose-300' },
  { value: 'ORDERED', label: 'PO Ordered', color: 'bg-blue-50 text-blue-700 border-blue-300' },
];

export const REQUEST_PRIORITIES = [
  { value: 'NORMAL', label: 'Normal', badge: 'bg-surface-subtle text-ink-600 border-surface-border' },
  { value: 'HIGH', label: 'High Priority', badge: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300' },
  { value: 'URGENT', label: 'Urgent', badge: 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/40 dark:text-rose-300' },
  { value: 'CRITICAL', label: 'Critical Site Need', badge: 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950/40 dark:text-purple-300' },
];

// ─── Local Fallback Data (Used for offline & immediate client responsiveness) ──
let localMaterialRequests = [
  {
    id: 1,
    requestNumber: 'MRF-2026-001',
    projectId: 1,
    projectName: 'Metro Rail Phase 2',
    materialId: 1,
    materialCode: 'MAT-CEM-43',
    materialName: 'OPC 43 Grade Cement',
    unit: 'BAGS',
    requiredQty: 250,
    requiredDate: new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10),
    status: 'PENDING',
    priority: 'HIGH',
    siteId: 1,
    siteName: 'Station Box Site A',
    wbsActivityId: 101,
    activityName: 'Concourse Slab Concrete Pour',
    zone: 'Pier Grid P12-P16',
    contractorId: 1,
    contractorName: 'L&T Heavy Civil Infra',
    requestedBy: 'Site Eng. Selva',
    approvedBy: null,
    rejectionReason: null,
    remarks: 'Required for scheduled evening pour. Fast-track approval needed.',
    createdAt: new Date(Date.now() - 24 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 24 * 3600000).toISOString(),
  },
  {
    id: 2,
    requestNumber: 'MRF-2026-002',
    projectId: 1,
    projectName: 'Metro Rail Phase 2',
    materialId: 2,
    materialCode: 'MAT-STE-12',
    materialName: 'Fe500D TMT Rebar 12mm',
    unit: 'TONNES',
    requiredQty: 15,
    requiredDate: new Date(Date.now() + 5 * 86400000).toISOString().slice(0, 10),
    status: 'APPROVED',
    priority: 'NORMAL',
    siteId: 1,
    siteName: 'Station Box Site A',
    wbsActivityId: 102,
    activityName: 'Retaining Wall Reinforcement',
    zone: 'East Retaining Wall Bay 4',
    contractorId: 2,
    contractorName: 'Afcons Reinforcement Team',
    requestedBy: 'QS Coordinator Rajesh',
    approvedBy: 'PM Selvamani',
    rejectionReason: null,
    remarks: 'Pre-requisition for next week rebar tying work.',
    createdAt: new Date(Date.now() - 48 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 12 * 3600000).toISOString(),
  },
  {
    id: 3,
    requestNumber: 'MRF-2026-003',
    projectId: 1,
    projectName: 'Metro Rail Phase 2',
    materialId: 4,
    materialCode: 'MAT-AGG-20MM',
    materialName: 'Blue Metal Aggregate 20mm',
    unit: 'TONNES',
    requiredQty: 40,
    requiredDate: new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 10),
    status: 'PENDING',
    priority: 'URGENT',
    siteId: 2,
    siteName: 'Elevated Viaduct Section B',
    wbsActivityId: 103,
    activityName: 'Base Subgrade Compaction',
    zone: 'Pier 42 Ramp',
    contractorId: 3,
    contractorName: 'Shapoorji Earthworks',
    requestedBy: 'Site Sup. Vikram',
    approvedBy: null,
    rejectionReason: null,
    remarks: 'Emergency replenishment due to accelerated earthwork timeline.',
    createdAt: new Date(Date.now() - 6 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 6 * 3600000).toISOString(),
  },
];

function isNetworkError(err) {
  return (
    !err.response ||
    err.code === 'ECONNABORTED' ||
    err.code === 'ERR_NETWORK' ||
    err.message === 'Network Error' ||
    err.response?.status >= 500
  );
}

function extractList(raw) {
  if (Array.isArray(raw)) return raw;
  if (raw && typeof raw === 'object') {
    if (Array.isArray(raw.data)) return raw.data;
    if (Array.isArray(raw.content)) return raw.content;
    if (Array.isArray(raw.items)) return raw.items;
  }
  return [];
}

function extractSingle(raw) {
  if (raw && typeof raw === 'object' && raw.data !== undefined) return raw.data;
  return raw;
}

function normaliseRequest(item) {
  if (!item) return null;
  return {
    id: item.id ?? Date.now(),
    requestNumber: item.requestNumber || `MRF-2026-${String(item.id || Math.floor(Math.random() * 900 + 100)).padStart(3, '0')}`,
    projectId: item.projectId ? Number(item.projectId) : 1,
    projectName: item.projectName || 'Metro Rail Phase 2',
    materialId: item.materialId ? Number(item.materialId) : null,
    materialCode: item.materialCode || item.material?.materialCode || '',
    materialName: item.materialName || item.material?.name || '',
    unit: item.unit || item.material?.unit || 'BAGS',
    requiredQty: Number(item.requiredQty ?? item.quantity ?? 0),
    requiredDate: item.requiredDate ? String(item.requiredDate).slice(0, 10) : '',
    status: String(item.status || 'PENDING').toUpperCase(),
    priority: String(item.priority || 'NORMAL').toUpperCase(),
    siteId: item.siteId ? Number(item.siteId) : null,
    siteName: item.siteName || '',
    wbsActivityId: item.wbsActivityId ? Number(item.wbsActivityId) : null,
    activityName: item.activityName || '',
    zone: item.zone || '',
    contractorId: item.contractorId ? Number(item.contractorId) : null,
    contractorName: item.contractorName || '',
    requestedBy: item.requestedBy || 'Site Engineer',
    approvedBy: item.approvedBy || null,
    rejectionReason: item.rejectionReason || null,
    remarks: item.remarks || '',
    createdAt: item.createdAt || new Date().toISOString(),
    updatedAt: item.updatedAt || new Date().toISOString(),
  };
}

export const materialRequestsApi = {
  async listByProject(projectId = 1) {
    const res = await apiClient.get(`/procurement/requests/project/${projectId}`);
    return extractList(res.data).map(normaliseRequest);
  },
  async listByStatus(projectId = 1, status = 'PENDING') {
    const res = await apiClient.get(`/procurement/requests/project/${projectId}/status/${status}`);
    return extractList(res.data).map(normaliseRequest);
  },
  async getProjectedShortage(projectId = 1) {
    const res = await apiClient.get(`/procurement/requests/project/${projectId}/projected-shortage`);
    return extractList(res.data);
  },
  async getById(id) {
    const res = await apiClient.get(`/procurement/requests/${id}`);
    return normaliseRequest(extractSingle(res.data));
  },
  async create(payload) {
    const body = {
      projectId: Number(payload.projectId),
      materialId: Number(payload.materialId),
      requiredQty: Number(payload.requiredQty),
      requiredDate: payload.requiredDate ? String(payload.requiredDate).slice(0, 10) : null,
      status: 'PENDING',
      siteId: payload.siteId ? Number(payload.siteId) : null,
      wbsActivityId: payload.wbsActivityId ? Number(payload.wbsActivityId) : null,
      zone: payload.zone?.trim() || null,
      contractorId: payload.contractorId ? Number(payload.contractorId) : null,
      requestedBy: payload.requestedBy?.trim() || null,
      remarks: payload.remarks?.trim() || null,
    };
    const res = await apiClient.post('/procurement/requests', body);
    return normaliseRequest(extractSingle(res.data));
  },
  async update(id, payload) {
    const res = await apiClient.put(`/procurement/requests/${id}`, payload);
    return normaliseRequest(extractSingle(res.data));
  },
  async updateApproval(id, approvalDto) {
    const res = await apiClient.put(`/procurement/requests/${id}/approval`, {
      status: approvalDto.status,
      approvedBy: approvalDto.approvedBy || null,
      rejectionReason: approvalDto.rejectionReason || null,
      remarks: approvalDto.remarks || null,
    });
    return normaliseRequest(extractSingle(res.data));
  },
  async delete(id) {
    await apiClient.delete(`/procurement/requests/${id}`);
    return true;
  },
};
