import { apiClient } from '@/lib/apiClient';

const listData = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.items)) return data.items;
  return [];
};

const singleData = (data) => (data?.data && typeof data.data === 'object' && !Array.isArray(data.data) ? data.data : data);

const projectPath = (projectId = 1) => `/procurement/purchase-orders/project/${projectId}`;

export const procurementApi = {
  // Material requests
  listMaterialRequests: async (projectId = 1) => listData((await apiClient.get(`/procurement/requests/project/${projectId}`)).data),
  listMaterialRequestsByStatus: async (projectId, status) => listData((await apiClient.get(`/procurement/requests/project/${projectId}/status/${status}`)).data),
  getMaterialRequest: async (id) => singleData((await apiClient.get(`/procurement/requests/${id}`)).data),
  createMaterialRequest: async (payload) => singleData((await apiClient.post('/procurement/requests', payload)).data),
  updateMaterialRequest: async (id, payload) => singleData((await apiClient.put(`/procurement/requests/${id}`, payload)).data),
  updateMaterialRequestApproval: async (id, payload) => singleData((await apiClient.put(`/procurement/requests/${id}/approval`, payload)).data),
  deleteMaterialRequest: async (id) => (await apiClient.delete(`/procurement/requests/${id}`)).data,
  getProjectedShortages: async (projectId = 1) => listData((await apiClient.get(`/procurement/requests/project/${projectId}/projected-shortage`)).data),

  // Purchase orders
  list: async ({ projectId = 1 } = {}) => listData((await apiClient.get(projectPath(projectId))).data),
  getById: async (id) => singleData((await apiClient.get(`/procurement/purchase-orders/${id}`)).data),
  create: async (payload) => singleData((await apiClient.post('/procurement/purchase-orders', payload)).data),
  update: async (id, payload) => singleData((await apiClient.put(`/procurement/purchase-orders/${id}`, payload)).data),
  approve: async (id, payload) => singleData((await apiClient.put(`/procurement/purchase-orders/${id}/approval`, payload)).data),
  updateStatus: async (id, payload) => singleData((await apiClient.put(`/procurement/purchase-orders/${id}/status`, payload)).data),
  getFulfillment: async (id) => singleData((await apiClient.get(`/procurement/purchase-orders/${id}/fulfillment`)).data),
  deletePurchaseOrder: async (id) => (await apiClient.delete(`/procurement/purchase-orders/${id}`)).data,

  // Goods receipt notes
  createGrn: async (payload) => singleData((await apiClient.post('/procurement/grn', {
    ...payload,
    poId: Number(payload.poId),
    materialId: Number(payload.materialId),
    projectId: payload.projectId == null ? null : Number(payload.projectId),
    siteId: payload.siteId == null ? null : Number(payload.siteId),
    receivedQty: Number(payload.receivedQty),
    acceptedQty: Number(payload.acceptedQty),
    rejectedQty: Number(payload.rejectedQty || 0),
  })).data),
  updateGrn: async (id, payload) => singleData((await apiClient.put(`/procurement/grn/${id}`, payload)).data),
  getGrnById: async (id) => singleData((await apiClient.get(`/procurement/grn/${id}`)).data),
  getGrnsByPo: async (poId) => listData((await apiClient.get(`/procurement/grn/po/${poId}`)).data),
  deleteGrn: async (id) => (await apiClient.delete(`/procurement/grn/${id}`)).data,
  listGrns: async (projectId = 1) => {
    const purchaseOrders = await procurementApi.list({ projectId });
    const groups = await Promise.all(purchaseOrders.map(async (po) => {
      const grns = await procurementApi.getGrnsByPo(po.id);
      return grns.map((grn) => ({ ...grn, poNumber: po.poNumber, supplierId: po.supplierId }));
    }));
    return groups.flat();
  },

  // Material catalog used by PO/GRN forms
  listMaterials: async () => listData((await apiClient.get('/materials')).data),
  getMaterial: async (id) => singleData((await apiClient.get(`/materials/${id}`)).data),
  getMaterialBalance: async (id) => singleData((await apiClient.get(`/materials/${id}/balance`)).data),
  listLowStockMaterials: async (projectId) => listData((await apiClient.get('/materials/low-stock', { params: projectId ? { projectId } : undefined })).data),
  listReorderAlerts: async () => listData((await apiClient.get('/materials/reorder-alerts')).data),
};
