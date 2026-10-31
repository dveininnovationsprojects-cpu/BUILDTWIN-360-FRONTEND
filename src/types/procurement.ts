// src/types/procurement.ts
export interface Supplier {
  id: number;
  supplierCode: string;
  name: string;
  contactPerson?: string;
  phone: string;
  email?: string;
  gstin?: string;
  panNumber?: string;
  bankAccountNumber?: string;
  bankName?: string;
  bankIfscCode?: string;
  bankBranch?: string;
  categorySpecialization?: string;
  address?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING_VERIFICATION' | 'BLACKLISTED';
  createdAt?: string;
}

export interface SupplierCreateDto {
  supplierCode: string;
  name: string;
  contactPerson?: string;
  phone: string;
  email?: string;
  gstin?: string;
  panNumber?: string;
  bankAccountNumber?: string;
  bankName?: string;
  bankIfscCode?: string;
  bankBranch?: string;
  categorySpecialization?: string;
  address?: string;
  status?: string;
}

export interface MaterialRequest {
  id: number;
  projectId: number;
  materialId: number;
  requiredQty: number;
  requiredDate?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ORDERED';
  siteId?: number;
  wbsActivityId?: number;
  zone?: string;
  contractorId?: number;
  requestedBy?: string;
  approvedBy?: string;
  rejectionReason?: string;
  justification?: string;
  remarks?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MaterialRequestApprovalDto {
  status: 'APPROVED' | 'REJECTED';
  approvedBy: string;
  rejectionReason?: string;
  remarks?: string;
}

export interface ProjectedShortageDto {
  materialId: number;
  materialName: string;
  currentStoreBalance: number;
  approvedIndentPendingQty: number;
  projectedShortageQty: number;
  unit: string;
}

export interface PurchaseOrder {
  id: number;
  poNumber?: string;
  supplierId: number;
  projectId: number;
  materialId?: number;
  orderQty?: number;
  unitRate?: number;
  amount?: number;
  deliveryDate?: string;
  status: 'PENDING_APPROVAL' | 'APPROVED' | 'ISSUED' | 'PARTIALLY_DELIVERED' | 'FULFILLED' | 'CANCELLED';
  approvedBy?: string;
  rejectionReason?: string;
  remarks?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PurchaseOrderApprovalDto {
  status: 'APPROVED' | 'REJECTED' | 'ISSUED';
  approvedBy: string;
  rejectionReason?: string;
  remarks?: string;
}

export interface PurchaseOrderStatusDto {
  status: 'DRAFT' | 'ISSUED' | 'PARTIALLY_FULFILLED' | 'FULFILLED' | 'CANCELLED';
  remarks?: string;
  updatedBy?: string;
}

export interface PoFulfillmentDto {
  poId: number;
  poNumber: string;
  orderedQty: number;
  totalReceivedQty: number;
  totalAcceptedQty: number;
  totalRejectedQty: number;
  remainingQtyToDeliver: number;
  fulfillmentPercentage: number;
  fulfillmentStatus: string;
}

export interface Grn {
  id: number;
  poId: number;
  materialId: number;
  dcNumber?: string;
  vehicleNumber?: string;
  gateEntryNumber?: string;
  receivedQty: number;
  acceptedQty: number;
  rejectedQty?: number;
  damageReason?: string;
  projectId?: number;
  siteId?: number;
  grnNumber?: string;
  rejectionReason?: string;
  receivedBy?: string;
  deliveryEvidenceUrl?: string;
  status: 'COMPLETED' | 'VOID';
  createdAt?: string;
}
