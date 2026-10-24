export type RequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'FULFILLED' | 'CANCELLED';
export type PoStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'ISSUED' | 'PARTIALLY_FULFILLED' | 'FULFILLED' | 'CANCELLED';
export type StockTransactionType = 'RECEIPT' | 'ISSUE' | 'CONSUMPTION' | 'RETURN' | 'WASTAGE' | 'ADJUSTMENT';

export interface MaterialRequest {
  id?: number;
  projectId: number;
  materialId: number;
  wbsActivityId?: number;
  requestedQuantity: number;
  requiredDate: string; // YYYY-MM-DD
  status: RequestStatus;
  rejectionReason?: string;
  remarks?: string;
  createdAt?: string;
}

export interface PurchaseOrder {
  id?: number;
  poNumber?: string;
  projectId: number;
  supplierId: number;
  materialId: number;
  orderedQuantity: number;
  unitPrice: number;
  totalAmount: number;
  deliveryDate: string; // YYYY-MM-DD
  status: PoStatus;
  approvalRemarks?: string;
}

export interface Grn {
  id?: number;
  grnNumber?: string;
  purchaseOrderId: number;
  projectId: number;
  materialId: number;
  receivedQuantity: number;
  acceptedQuantity: number;
  rejectedQuantity: number;
  deliveryChallanNumber: string;
  vehicleNumber?: string;
  deliveryPhotoUrl?: string;
  remarks?: string;
  receivedAt?: string;
}

export interface StockTransactionDto {
  projectId: number;
  materialId: number;
  wbsActivityId?: number;
  transactionType: StockTransactionType;
  quantity: number;
  unitPrice?: number;
  referenceType?: string; // 'GRN', 'MANUAL_ISSUE', 'DAILY_CONSUMPTION'
  referenceId?: number;
  remarks?: string;
}

export interface ProjectedShortageDto {
  materialId: number;
  materialName: string;
  currentStock: number;
  pendingRequestedQty: number;
  projectedDeficit: number;
  shortageSeverity: 'SAFE' | 'WARNING' | 'CRITICAL';
}
