// src/api/procurementApi.ts
import { http } from './client';
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
} from './types';

export const procurementApi = {
  // --- Suppliers Directory (/api/v1/suppliers) ---
  getAllSuppliers: () => http.get<Supplier[]>('/suppliers'),
  getSupplierById: (id: number) => http.get<Supplier>(`/suppliers/${id}`),
  getSupplierByCode: (code: string) => http.get<Supplier>(`/suppliers/code/${code}`),
  getSuppliersByStatus: (status: string) => http.get<Supplier[]>(`/suppliers/status/${status}`),
  createSupplier: (dto: SupplierCreateDto) => http.post<Supplier>('/suppliers', dto),
  updateSupplier: (id: number, dto: SupplierCreateDto) => http.put<Supplier>(`/suppliers/${id}`, dto),
  deleteSupplier: (id: number) => http.delete<void>(`/suppliers/${id}`),

  // --- Material Indents / Requests (/api/v1/procurement/requests) ---
  createMaterialRequest: (dto: Partial<MaterialRequest>) =>
    http.post<MaterialRequest>('/procurement/requests', dto),
  getAllMaterialRequests: (projectId?: number) =>
    http.get<MaterialRequest[]>('/procurement/requests', { projectId }),
  getMaterialRequestById: (id: number) =>
    http.get<MaterialRequest>(`/procurement/requests/${id}`),
  updateMaterialRequest: (id: number, dto: Partial<MaterialRequest>) =>
    http.put<MaterialRequest>(`/procurement/requests/${id}`, dto),
  processIndentApproval: (id: number, dto: MaterialRequestApprovalDto) =>
    http.put<MaterialRequest>(`/procurement/requests/${id}/approval`, dto),
  deleteMaterialRequest: (id: number) =>
    http.delete<void>(`/procurement/requests/${id}`),
  getMaterialRequestsByProject: (projectId: number) =>
    http.get<MaterialRequest[]>(`/procurement/requests/project/${projectId}`),
  getMaterialRequestsByStatus: (projectId: number, status: string) =>
    http.get<MaterialRequest[]>(`/procurement/requests/project/${projectId}/status/${status}`),
  getProjectedShortages: (projectId: number) =>
    http.get<ProjectedShortageDto[]>(`/procurement/requests/project/${projectId}/projected-shortage`),

  // --- Purchase Orders (PO) (/api/v1/procurement/purchase-orders) ---
  createPurchaseOrder: (dto: Partial<PurchaseOrder>) =>
    http.post<PurchaseOrder>('/procurement/purchase-orders', dto),
  getAllPurchaseOrders: (projectId?: number) =>
    http.get<PurchaseOrder[]>('/procurement/purchase-orders', { projectId }),
  getPurchaseOrderById: (id: number) =>
    http.get<PurchaseOrder>(`/procurement/purchase-orders/${id}`),
  updatePurchaseOrder: (id: number, dto: Partial<PurchaseOrder>) =>
    http.put<PurchaseOrder>(`/procurement/purchase-orders/${id}`, dto),
  processPoFinancialApproval: (id: number, dto: PurchaseOrderApprovalDto) =>
    http.put<PurchaseOrder>(`/procurement/purchase-orders/${id}/approval`, dto),
  updatePurchaseOrderStatus: (id: number, dto: PurchaseOrderStatusDto) =>
    http.put<PurchaseOrder>(`/procurement/purchase-orders/${id}/status`, dto),
  getPoFulfillmentStatus: (id: number) =>
    http.get<PoFulfillmentDto>(`/procurement/purchase-orders/${id}/fulfillment`),
  deletePurchaseOrder: (id: number) =>
    http.delete<void>(`/procurement/purchase-orders/${id}`),

  // --- Goods Receipt Notes (GRN) (/api/v1/procurement/grn) ---
  recordGrn: (dto: Partial<Grn>) =>
    http.post<Grn>('/procurement/grn', dto),
  getAllGrns: (projectId?: number) =>
    http.get<Grn[]>('/procurement/grn', { projectId }),
  getGrnById: (id: number) =>
    http.get<Grn>(`/procurement/grn/${id}`),
  getGrnsByProject: (projectId: number) =>
    http.get<Grn[]>(`/procurement/grn/project/${projectId}`),
  getGrnsByPo: (poId: number) =>
    http.get<Grn[]>(`/procurement/grn/po/${poId}`),
  updateGrn: (id: number, dto: Partial<Grn>) =>
    http.put<Grn>(`/procurement/grn/${id}`, dto),
  voidGrn: (id: number) =>
    http.delete<void>(`/procurement/grn/${id}`),
};
