import { apiClient } from '@/lib/apiClient';
import type { Budget } from '../types';

// Maps to /budgets (spec section 14 - API Requirements).
export const costControlApi = {
  list: (params?: Record<string, unknown>) =>
    apiClient.get<Budget[]>('/budgets', { params }).then((r) => r.data),
  getById: (id: string) => apiClient.get<Budget>(`/budgets/${id}`).then((r) => r.data),
  create: (payload: Partial<Budget>) =>
    apiClient.post<Budget>('/budgets', payload).then((r) => r.data),
  update: (id: string, payload: Partial<Budget>) =>
    apiClient.put<Budget>(`/budgets/${id}`, payload).then((r) => r.data),
};
