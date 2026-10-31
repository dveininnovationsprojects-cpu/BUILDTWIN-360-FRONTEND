// src/types/notifications.ts
export type NotificationType =
  | 'LOW_STOCK'
  | 'CRITICAL_BLOCKER'
  | 'OVERDUE_SLA'
  | 'BUDGET_OVERRUN'
  | 'NCR_FAILED'
  | 'NCR_AUDIT_REJECTED'
  | 'GENERAL_INFO';

export type NotificationPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type NotificationStatus = 'UNREAD' | 'READ' | 'DISMISSED' | 'ARCHIVED';

export interface Notification {
  id: number;
  projectId: number;
  recipientUsername: string;
  targetRole?: string;
  title: string;
  message: string;
  notificationType: NotificationType;
  priority: NotificationPriority;
  status: NotificationStatus;
  channel: 'IN_APP' | 'EMAIL' | 'SMS' | 'WEBSOCKET';
  referenceModule?: string;
  referenceId?: number;
  readAt?: string;
  createdAt: string;
}

export interface SendNotificationDto {
  projectId: number;
  recipientUsername?: string;
  targetRole?: string;
  title: string;
  message: string;
  notificationType: NotificationType;
  priority: NotificationPriority;
  channel?: 'IN_APP' | 'EMAIL' | 'SMS' | 'WEBSOCKET';
  referenceModule?: string;
  referenceId?: number;
}

export interface NotificationSummaryDto {
  username: string;
  unreadCount: number;
  urgentCount: number;
  lastUpdated: string;
}
