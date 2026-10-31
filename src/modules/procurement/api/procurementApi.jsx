import { apiClient } from '@/lib/apiClient';

const listData = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.items)) return data.items;
  return [];
};

const singleData = (data) =>
  data?.data && typeof data.data === 'object' && !Array.isArray(data.data) ? data.data : data;

const projectPath = (projectId = 1) => `/procurement/purchase-orders/project/${projectId}`;

export const procurementApi = {
  // --- 1. Material Requests (MR) ---
  listMaterialRequests: async (projectId = 1) =>
    listData((await apiClient.get(`/procurement/requests/project/${projectId}`)).data),
  listMaterialRequestsByStatus: async (projectId, status) =>
    listData((await apiClient.get(`/procurement/requests/project/${projectId}/status/${status}`)).data),
  getMaterialRequest: async (id) => singleData((await apiClient.get(`/procurement/requests/${id}`)).data),
  createMaterialRequest: async (payload) => {
    const qty = Number(payload.requiredQty ?? payload.requestedQuantity ?? 0);
    return singleData(
      (
        await apiClient.post('/procurement/requests', {
          ...payload,
          projectId: Number(payload.projectId),
          materialId: Number(payload.materialId),
          requiredQty: qty,
          requestedQuantity: qty,
          requiredDate: payload.requiredDate,
          status: payload.status || 'PENDING',
        })
      ).data
    );
  },
  updateMaterialRequest: async (id, payload) =>
    singleData((await apiClient.put(`/procurement/requests/${id}`, payload)).data),
  approveOrRejectRequest: async (id, approved, rejectionReason, approvedBy = 'PM_Selvamani') =>
    singleData(
      (
        await apiClient.put(`/procurement/requests/${id}/approval`, {
          status: approved ? 'APPROVED' : 'REJECTED',
          approvedBy: approvedBy || 'Project Manager',
          rejectionReason: rejectionReason || null,
        })
      ).data
    ),
  updateMaterialRequestApproval: async (id, payload) => {
    const status = payload.status || (payload.approved ? 'APPROVED' : 'REJECTED');
    const approvedBy = payload.approvedBy || 'Project Manager';
    return singleData(
      (
        await apiClient.put(`/procurement/requests/${id}/approval`, {
          status,
          approvedBy,
          rejectionReason: payload.rejectionReason || null,
          remarks: payload.remarks || null,
        })
      ).data
    );
  },
  deleteMaterialRequest: async (id) => (await apiClient.delete(`/procurement/requests/${id}`)).data,
  getProjectedShortages: async (projectId = 1) =>
    listData((await apiClient.get(`/procurement/requests/project/${projectId}/projected-shortage`)).data),

  // --- 2. Purchase Orders (PO) ---
  list: async ({ projectId = 1 } = {}) => listData((await apiClient.get(projectPath(projectId))).data),
  getById: async (id) => singleData((await apiClient.get(`/procurement/purchase-orders/${id}`)).data),
  create: async (payload) => procurementApi.createPurchaseOrder(payload),
  createPurchaseOrder: async (payload) => {
    const sId = Number(payload.supplierId);
    const pId = Number(payload.projectId);
    const mId = payload.materialId ? Number(payload.materialId) : null;
    const qty = Number(payload.orderQty ?? payload.orderedQuantity ?? 0);
    const rate = Number(payload.unitRate ?? payload.unitPrice ?? 0);
    const amt = Number(payload.amount ?? payload.totalAmount ?? (qty * rate));
    return singleData(
      (
        await apiClient.post('/procurement/purchase-orders', {
          ...payload,
          supplierId: sId,
          projectId: pId,
          materialId: mId,
          orderQty: qty,
          orderedQuantity: qty,
          unitRate: rate,
          unitPrice: rate,
          amount: amt,
          totalAmount: amt,
          deliveryDate: payload.deliveryDate,
          status: payload.status || 'PENDING_APPROVAL',
        })
      ).data
    );
  },
  update: async (id, payload) =>
    singleData((await apiClient.put(`/procurement/purchase-orders/${id}`, payload)).data),
  approve: async (id, payload) => {
    const status = payload.status || (payload.approved ? 'APPROVED' : 'REJECTED');
    const approvedBy = payload.approvedBy || 'Project Manager';
    return singleData(
      (
        await apiClient.put(`/procurement/purchase-orders/${id}/approval`, {
          status,
          approvedBy,
          rejectionReason: payload.rejectionReason || null,
          remarks: payload.remarks || payload.approvalRemarks || null,
        })
      ).data
    );
  },
  approvePurchaseOrder: async (id, approved, remarks, approvedBy = 'Director_Murugan') =>
    singleData(
      (
        await apiClient.put(`/procurement/purchase-orders/${id}/approval`, {
          status: approved ? 'APPROVED' : 'REJECTED',
          approvedBy: approvedBy || 'Director_Murugan',
          remarks: remarks || null,
          rejectionReason: !approved ? remarks : null,
        })
      ).data
    ),
  updateStatus: async (id, payload) =>
    singleData((await apiClient.put(`/procurement/purchase-orders/${id}/status`, payload)).data),
  getFulfillment: async (id) =>
    singleData((await apiClient.get(`/procurement/purchase-orders/${id}/fulfillment`)).data),
  getPoFulfillmentStatus: async (id) =>
    singleData((await apiClient.get(`/procurement/purchase-orders/${id}/fulfillment`)).data),
  deletePurchaseOrder: async (id) => (await apiClient.delete(`/procurement/purchase-orders/${id}`)).data,

  // --- 3. Goods Receipt Notes (GRN) ---
  createGrn: async (payload) => {
    const poIdNum = Number(payload.poId || payload.purchaseOrderId);
    const matIdNum = Number(payload.materialId);
    const recQty = Number(payload.receivedQty ?? payload.receivedQuantity ?? 0);
    const accQty = Number(payload.acceptedQty ?? payload.acceptedQuantity ?? 0);
    const rejQty = Number(payload.rejectedQty ?? payload.rejectedQuantity ?? 0);
    const dc = payload.dcNumber || payload.deliveryChallanNumber || payload.challanNumber || `DC-${Date.now()}`;
    const veh = payload.vehicleNumber || '';
    const reason = payload.damageReason || payload.rejectionReason || '';

    return singleData(
      (
        await apiClient.post('/procurement/grn', {
          ...payload,
          poId: poIdNum,
          purchaseOrderId: poIdNum,
          materialId: matIdNum,
          projectId: payload.projectId == null ? null : Number(payload.projectId),
          receivedQty: recQty,
          receivedQuantity: recQty,
          acceptedQty: accQty,
          acceptedQuantity: accQty,
          rejectedQty: rejQty,
          rejectedQuantity: rejQty,
          dcNumber: dc,
          deliveryChallanNumber: dc,
          vehicleNumber: veh,
          damageReason: reason,
          rejectionReason: reason,
          deliveryPhotoUrl: payload.deliveryPhotoUrl || payload.deliveryEvidenceUrl || '',
          remarks: payload.remarks || '',
        })
      ).data
    );
  },
  updateGrn: async (id, payload) => singleData((await apiClient.put(`/procurement/grn/${id}`, payload)).data),
  getGrnById: async (id) => singleData((await apiClient.get(`/procurement/grn/${id}`)).data),
  getGrnsByPo: async (poId) => listData((await apiClient.get(`/procurement/grn/po/${poId}`)).data),
  deleteGrn: async (id) => (await apiClient.delete(`/procurement/grn/${id}`)).data,
  listGrns: async (projectId = 1) => {
    try {
      const res = await apiClient.get(`/procurement/grn/project/${projectId}`);
      const items = listData(res.data);
      if (items.length > 0) return items;
    } catch {
      // Fallback to iterating POs
    }
    const purchaseOrders = await procurementApi.list({ projectId });
    const groups = await Promise.all(
      purchaseOrders.map(async (po) => {
        try {
          const grns = await procurementApi.getGrnsByPo(po.id);
          return grns.map((grn) => ({ ...grn, poNumber: po.poNumber, supplierId: po.supplierId }));
        } catch {
          return [];
        }
      })
    );
    return groups.flat();
  },

  // --- 4. Stock Ledger & Site Consumptions (StockLedgerController) ---
  issueMaterialToSite: async (data) =>
    singleData((await apiClient.post('/stock-ledger/issue', data)).data),
  recordSiteConsumption: async (data) =>
    singleData((await apiClient.post('/stock-ledger/consumption', data)).data),
  recordReturn: async (data) =>
    singleData((await apiClient.post('/stock-ledger/return', data)).data),
  reconcilePhysicalStock: async (payload) =>
    singleData((await apiClient.post('/stock-ledger/reconcile', payload)).data),
  getStockLedgerByProject: async (projectId = 1) =>
    listData((await apiClient.get(`/stock-ledger/project/${projectId}`)).data),

  // --- 5. Catalog Helpers ---
  listMaterials: async () => listData((await apiClient.get('/materials')).data),
  getMaterial: async (id) => singleData((await apiClient.get(`/materials/${id}`)).data),
  getMaterialBalance: async (id) => singleData((await apiClient.get(`/materials/${id}/balance`)).data),
  listLowStockMaterials: async (projectId) =>
    listData((await apiClient.get('/materials/low-stock', { params: projectId ? { projectId } : undefined })).data),
  listReorderAlerts: async () => listData((await apiClient.get('/materials/reorder-alerts')).data),
};

export { procurementService } from '@/services/procurementService';

