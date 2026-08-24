import { apiClient } from '@/lib/apiClient';
import type { PurchaseOrder } from '../types';

// Maps to /purchase-orders (spec section 14 - API Requirements).
export const procurementApi = {
  list: (params?: Record<string, unknown>) =>
    apiClient.get<PurchaseOrder[]>('/purchase-orders', { params }).then((r) => r.data),
  getById: (id: string) => apiClient.get<PurchaseOrder>(`/purchase-orders/${id}`).then((r) => r.data),
  create: (payload: Partial<PurchaseOrder>) =>
    apiClient.post<PurchaseOrder>('/purchase-orders', payload).then((r) => r.data),
  update: (id: string, payload: Partial<PurchaseOrder>) =>
    apiClient.put<PurchaseOrder>(`/purchase-orders/${id}`, payload).then((r) => r.data),
};
