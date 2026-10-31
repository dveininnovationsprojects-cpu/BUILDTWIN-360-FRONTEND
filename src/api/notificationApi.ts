// src/api/notificationApi.ts
import { http } from './client';
import {
  Notification,
  SendNotificationDto,
  NotificationSummaryDto,
  PageResponse,
} from './types';

export const notificationApi = {
  // Dispatch Alert
  sendNotification: (dto: SendNotificationDto) =>
    http.post<Notification>('/notifications/send', dto),

  // Inboxes
  getMyInbox: (status?: 'UNREAD' | 'READ' | 'ARCHIVED', page = 0, size = 20) =>
    http.get<PageResponse<Notification>>('/notifications/my-inbox', { status, page, size }),
  getUserInbox: (username: string, status?: string, page = 0, size = 20) =>
    http.get<PageResponse<Notification>>(`/notifications/inbox/${username}`, { status, page, size }),
  getProjectNotifications: (projectId: number, type?: string) =>
    http.get<Notification[]>(`/notifications/project/${projectId}`, { type }),

  // Status transitions
  markAsRead: (id: number) =>
    http.put<Notification>(`/notifications/${id}/read`),
  markAllAsRead: (username: string) =>
    http.put<number>(`/notifications/inbox/${username}/read-all`),
  archiveNotification: (id: number) =>
    http.put<Notification>(`/notifications/${id}/archive`),
  deleteNotification: (id: number) =>
    http.delete<void>(`/notifications/${id}`),

  // Header Badge Counters
  getMySummaryBadge: () =>
    http.get<NotificationSummaryDto>('/notifications/my-summary'),
  getUserSummaryBadge: (username: string) =>
    http.get<NotificationSummaryDto>(`/notifications/summary/${username}`),
};
