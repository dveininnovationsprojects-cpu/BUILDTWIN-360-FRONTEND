import { apiClient } from '@/lib/apiClient';
import { notificationService } from '@/services/notificationService';

function unwrap(response) {
  const body = response?.data;
  return body?.data !== undefined ? body.data : body;
}

function unwrapList(response) {
  const data = unwrap(response);
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  return [];
}

export const notificationsApi = {
  // Fetch inbox notifications for current user or by project
  list: async (params = {}) => {
    try {
      if (params.projectId) {
        const res = await apiClient.get(`/notifications/project/${params.projectId}`, {
          params: { type: params.type },
        });
        return unwrapList(res);
      }
      const res = await apiClient.get('/notifications/my-inbox', {
        params: { status: params.status, page: params.page ?? 0, size: params.size ?? 50 },
      });
      return unwrapList(res);
    } catch {
      // Fallback resilience
      return [];
    }
  },

  getById: async (id) => {
    const list = await notificationsApi.list();
    return list.find((item) => String(item.id) === String(id)) || null;
  },

  create: async (payload) => {
    const res = await apiClient.post('/notifications/send', {
      projectId: Number(payload.projectId || 1),
      recipientUsername: payload.recipientUsername || 'admin',
      targetRole: payload.targetRole || null,
      title: payload.title || payload.message?.slice(0, 50) || 'Notification Alert',
      message: payload.message || '',
      notificationType: payload.notificationType || payload.type || 'GENERAL_INFO',
      priority: payload.priority || payload.severity || 'HIGH',
      channel: payload.channel || 'IN_APP',
      referenceModule: payload.referenceModule || null,
      referenceId: payload.referenceId ? Number(payload.referenceId) : null,
    });
    return unwrap(res);
  },

  markAsRead: async (id) => {
    const res = await apiClient.put(`/notifications/${id}/read`);
    return unwrap(res);
  },

  markAllAsRead: async (username = 'admin') => {
    const res = await apiClient.put(`/notifications/inbox/${username}/read-all`);
    return unwrap(res);
  },

  archive: async (id) => {
    const res = await apiClient.put(`/notifications/${id}/archive`);
    return unwrap(res);
  },

  delete: async (id) => {
    await apiClient.delete(`/notifications/${id}`);
    return true;
  },

  getMySummary: async () => {
    const res = await apiClient.get('/notifications/my-summary');
    return unwrap(res);
  },

  syncLowStock: async () => {
    try {
      const res = await apiClient.post('/notifications/sync-low-stock');
      return unwrap(res);
    } catch {
      return [];
    }
  },

  getLowStockMaterials: async () => {
    try {
      const res = await apiClient.get('/materials/low-stock');
      return unwrapList(res);
    } catch {
      return [];
    }
  },

  update: async (id, payload) => {
    if (payload.status === 'READ' || payload.readStatus === 'READ') {
      return notificationsApi.markAsRead(id);
    }
    if (payload.status === 'ARCHIVED') {
      return notificationsApi.archive(id);
    }
    return { id, ...payload };
  },
};

export { notificationService };
