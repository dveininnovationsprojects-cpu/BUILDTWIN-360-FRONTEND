import { apiClient } from '@/lib/apiClient';
import type { Notification } from '../types';

// Maps to /notifications (spec section 14 - API Requirements).
export const notificationsApi = {
  list: (params?: Record<string, unknown>) =>
    apiClient.get<Notification[]>('/notifications', { params }).then((r) => r.data),
  getById: (id: string) => apiClient.get<Notification>(`/notifications/${id}`).then((r) => r.data),
  create: (payload: Partial<Notification>) =>
    apiClient.post<Notification>('/notifications', payload).then((r) => r.data),
  update: (id: string, payload: Partial<Notification>) =>
    apiClient.put<Notification>(`/notifications/${id}`, payload).then((r) => r.data),
};
