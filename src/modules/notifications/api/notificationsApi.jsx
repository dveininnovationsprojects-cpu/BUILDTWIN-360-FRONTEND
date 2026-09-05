import { apiClient } from '@/lib/apiClient';

const MOCK_NOTIFICATIONS = [
  { id: 'notif-001', message: 'ALERT: Cement Stock Shortage predicted in 4 days (Aug 29)', severity: 'HIGH', createdAt: '2026-08-25 09:00', readStatus: 'UNREAD' },
  { id: 'notif-002', message: 'Ground Floor Slab Concreting ACT-104 DRS exceeds threshold (72.0)', severity: 'CRITICAL', createdAt: '2026-08-25 08:30', readStatus: 'UNREAD' },
  { id: 'notif-003', message: 'NCR-042 Quality honeycombing issue is overdue past 5-day SLA', severity: 'MEDIUM', createdAt: '2026-08-24 17:45', readStatus: 'READ' },
];

// Maps to /notifications (spec section 14 - API Requirements).
export const notificationsApi = {
  list: (params) =>
    apiClient.get('/notifications', { params }).then((r) => r.data).catch(() => MOCK_NOTIFICATIONS),
  getById: (id) => apiClient.get(`/notifications/${id}`).then((r) => r.data).catch(() => MOCK_NOTIFICATIONS[0]),
  create: (payload) =>
    apiClient.post('/notifications', payload).then((r) => r.data).catch(() => ({ id: `notif-${Date.now()}`, ...payload })),
  update: (id, payload) =>
    apiClient.put(`/notifications/${id}`, payload).then((r) => r.data).catch(() => ({ id, ...payload })),
};

