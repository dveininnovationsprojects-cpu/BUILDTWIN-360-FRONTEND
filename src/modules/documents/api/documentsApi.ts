import { apiClient } from '@/lib/apiClient';
import type { Document } from '../types';

// Maps to /documents (spec section 14 - API Requirements).
export const documentsApi = {
  list: (params?: Record<string, unknown>) =>
    apiClient.get<Document[]>('/documents', { params }).then((r) => r.data),
  getById: (id: string) => apiClient.get<Document>(`/documents/${id}`).then((r) => r.data),
  create: (payload: Partial<Document>) =>
    apiClient.post<Document>('/documents', payload).then((r) => r.data),
  update: (id: string, payload: Partial<Document>) =>
    apiClient.put<Document>(`/documents/${id}`, payload).then((r) => r.data),
};
