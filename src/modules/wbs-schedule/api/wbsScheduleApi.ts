import { apiClient } from '@/lib/apiClient';
import type { Activity } from '../types';

// Maps to /activities (spec section 14 - API Requirements).
export const wbsScheduleApi = {
  list: (params?: Record<string, unknown>) =>
    apiClient.get<Activity[]>('/activities', { params }).then((r) => r.data),
  getById: (id: string) => apiClient.get<Activity>(`/activities/${id}`).then((r) => r.data),
  create: (payload: Partial<Activity>) =>
    apiClient.post<Activity>('/activities', payload).then((r) => r.data),
  update: (id: string, payload: Partial<Activity>) =>
    apiClient.put<Activity>(`/activities/${id}`, payload).then((r) => r.data),
};
