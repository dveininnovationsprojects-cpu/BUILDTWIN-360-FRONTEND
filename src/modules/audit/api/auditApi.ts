import { apiClient } from '@/lib/apiClient';
import type { AuditLog } from '../types';

// Maps to /audit-logs (spec section 14 - API Requirements).
export const auditApi = {
  list: (params?: Record<string, unknown>) =>
    apiClient.get<AuditLog[]>('/audit-logs', { params }).then((r) => r.data),
  getById: (id: string) => apiClient.get<AuditLog>(`/audit-logs/${id}`).then((r) => r.data),
  create: (payload: Partial<AuditLog>) =>
    apiClient.post<AuditLog>('/audit-logs', payload).then((r) => r.data),
  update: (id: string, payload: Partial<AuditLog>) =>
    apiClient.put<AuditLog>(`/audit-logs/${id}`, payload).then((r) => r.data),
};
