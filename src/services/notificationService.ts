// src/services/notificationService.ts
import apiClient, { PageResponse } from '../api/client';
import {
  Notification,
  SendNotificationDto,
  NotificationSummaryDto,
  NotificationStatus,
  NotificationType,
} from '../types/notifications';

export const notificationService = {
  // ============================================================
  // Dispatch Alert (System or Manual)
  // ============================================================
  async dispatchNotification(dto: SendNotificationDto): Promise<Notification> {
    return apiClient.post('/notifications/send', dto);
  },

  // ============================================================
  // Inbox Queries
  // ============================================================
  async getMyInbox(status?: NotificationStatus, page = 0, size = 20): Promise<PageResponse<Notification>> {
    const params: Record<string, any> = { page, size, sort: 'createdAt,desc' };
    if (status) params.status = status;
    return apiClient.get('/notifications/my-inbox', { params });
  },

  async getUserInbox(username: string, status?: NotificationStatus, page = 0, size = 20): Promise<PageResponse<Notification>> {
    const params: Record<string, any> = { page, size, sort: 'createdAt,desc' };
    if (status) params.status = status;
    return apiClient.get(`/notifications/inbox/${username}`, { params });
  },

  async getProjectNotifications(projectId: number, type?: NotificationType): Promise<Notification[]> {
    const params = type ? { type } : {};
    return apiClient.get(`/notifications/project/${projectId}`, { params });
  },

  // ============================================================
  // Read & Archival State Transitions
  // ============================================================
  async markAsRead(id: number): Promise<Notification> {
    return apiClient.put(`/notifications/${id}/read`);
  },

  async markAllAsRead(username: string): Promise<number> {
    return apiClient.put(`/notifications/inbox/${username}/read-all`);
  },

  async archiveNotification(id: number): Promise<Notification> {
    return apiClient.put(`/notifications/${id}/archive`);
  },

  async deleteNotification(id: number): Promise<void> {
    return apiClient.delete(`/notifications/${id}`);
  },

  // ============================================================
  // Badge Counters for Navbar / Header
  // ============================================================
  async getMySummary(): Promise<NotificationSummaryDto> {
    return apiClient.get('/notifications/my-summary');
  },

  async getUserSummary(username: string): Promise<NotificationSummaryDto> {
    return apiClient.get(`/notifications/summary/${username}`);
  },
};
