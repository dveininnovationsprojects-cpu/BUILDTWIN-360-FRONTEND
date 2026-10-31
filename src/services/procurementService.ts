// src/services/procurementService.ts
import apiClient from '../api/client';
import {
  Supplier,
  SupplierCreateDto,
  MaterialRequest,
  MaterialRequestApprovalDto,
  ProjectedShortageDto,
  PurchaseOrder,
  PurchaseOrderApprovalDto,
  PurchaseOrderStatusDto,
  PoFulfillmentDto,
  Grn,
} from '../types/procurement';

export const procurementService = {
  // ==========================================
  // Supplier Master APIs (/api/v1/suppliers)
  // ==========================================
  async getSuppliers(): Promise<Supplier[]> {
    return apiClient.get('/suppliers');
  },

  async getSupplierById(id: number): Promise<Supplier> {
    return apiClient.get(`/suppliers/${id}`);
  },

  async getSupplierByCode(code: string): Promise<Supplier> {
    return apiClient.get(`/suppliers/code/${code}`);
  },

  async getSuppliersByStatus(status: string): Promise<Supplier[]> {
    return apiClient.get(`/suppliers/status/${status}`);
  },

  async createSupplier(payload: SupplierCreateDto): Promise<Supplier> {
    return apiClient.post('/suppliers', payload);
  },

  async updateSupplier(id: number, payload: SupplierCreateDto): Promise<Supplier> {
    return apiClient.put(`/suppliers/${id}`, payload);
  },

  async deleteSupplier(id: number): Promise<void> {
    return apiClient.delete(`/suppliers/${id}`);
  },

  // ========================================================
  // Material Indent / Requests (/api/v1/procurement/requests)
  // ========================================================
  async createMaterialRequest(payload: Partial<MaterialRequest>): Promise<MaterialRequest> {
    return apiClient.post('/procurement/requests', payload);
  },

  async getAllMaterialRequests(projectId?: number): Promise<MaterialRequest[]> {
    const params = projectId ? { projectId } : {};
    return apiClient.get('/procurement/requests', { params });
  },

  async getMaterialRequestById(id: number): Promise<MaterialRequest> {
    return apiClient.get(`/procurement/requests/${id}`);
  },

  async updateMaterialRequest(id: number, payload: Partial<MaterialRequest>): Promise<MaterialRequest> {
    return apiClient.put(`/procurement/requests/${id}`, payload);
  },

  async updateMaterialRequestApproval(id: number, dto: MaterialRequestApprovalDto): Promise<MaterialRequest> {
    return apiClient.put(`/procurement/requests/${id}/approval`, dto);
  },

  async deleteMaterialRequest(id: number): Promise<void> {
    return apiClient.delete(`/procurement/requests/${id}`);
  },

  async getMaterialRequestsByProject(projectId: number): Promise<MaterialRequest[]> {
    return apiClient.get(`/procurement/requests/project/${projectId}`);
  },

  async getMaterialRequestsByStatus(projectId: number, status: string): Promise<MaterialRequest[]> {
    return apiClient.get(`/procurement/requests/project/${projectId}/status/${status}`);
  },

  async getProjectedShortages(projectId: number): Promise<ProjectedShortageDto[]> {
    return apiClient.get(`/procurement/requests/project/${projectId}/projected-shortage`);
  },

  // ===========================================================
  // Purchase Orders (PO) (/api/v1/procurement/purchase-orders)
  // ===========================================================
  async createPurchaseOrder(payload: Partial<PurchaseOrder>): Promise<PurchaseOrder> {
    return apiClient.post('/procurement/purchase-orders', payload);
  },

  async getAllPurchaseOrders(projectId?: number): Promise<PurchaseOrder[]> {
    const params = projectId ? { projectId } : {};
    return apiClient.get('/procurement/purchase-orders', { params });
  },

  async getPurchaseOrderById(id: number): Promise<PurchaseOrder> {
    return apiClient.get(`/procurement/purchase-orders/${id}`);
  },

  async updatePurchaseOrder(id: number, payload: Partial<PurchaseOrder>): Promise<PurchaseOrder> {
    return apiClient.put(`/procurement/purchase-orders/${id}`, payload);
  },

  async updatePurchaseOrderApproval(id: number, dto: PurchaseOrderApprovalDto): Promise<PurchaseOrder> {
    return apiClient.put(`/procurement/purchase-orders/${id}/approval`, dto);
  },

  async updatePurchaseOrderStatus(id: number, dto: PurchaseOrderStatusDto): Promise<PurchaseOrder> {
    return apiClient.put(`/procurement/purchase-orders/${id}/status`, dto);
  },

  async getPoFulfillmentStatus(id: number): Promise<PoFulfillmentDto> {
    return apiClient.get(`/procurement/purchase-orders/${id}/fulfillment`);
  },

  async deletePurchaseOrder(id: number): Promise<void> {
    return apiClient.delete(`/procurement/purchase-orders/${id}`);
  },

  async getPurchaseOrdersByProject(projectId: number): Promise<PurchaseOrder[]> {
    return apiClient.get(`/procurement/purchase-orders/project/${projectId}`);
  },

  // ====================================================
  // Goods Receipt Notes (GRN) (/api/v1/procurement/grn)
  // ====================================================
  async createGrn(payload: Partial<Grn>): Promise<Grn> {
    return apiClient.post('/procurement/grn', payload);
  },

  async getAllGrns(projectId?: number): Promise<Grn[]> {
    const params = projectId ? { projectId } : {};
    return apiClient.get('/procurement/grn', { params });
  },

  async getGrnById(id: number): Promise<Grn> {
    return apiClient.get(`/procurement/grn/${id}`);
  },

  async getGrnsByProject(projectId: number): Promise<Grn[]> {
    return apiClient.get(`/procurement/grn/project/${projectId}`);
  },

  async getGrnsByPo(poId: number): Promise<Grn[]> {
    return apiClient.get(`/procurement/grn/po/${poId}`);
  },

  async updateGrn(id: number, payload: Partial<Grn>): Promise<Grn> {
    return apiClient.put(`/procurement/grn/${id}`, payload);
  },

  async voidGrn(id: number): Promise<void> {
    return apiClient.delete(`/procurement/grn/${id}`);
  },
};
