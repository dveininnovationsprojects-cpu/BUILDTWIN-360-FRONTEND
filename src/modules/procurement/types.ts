// Supplier profile, PO tracking, delivery status and supplier performance (FR-060..063).
export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplier: string;
  deliveryDate: string;
  status: string;
}
