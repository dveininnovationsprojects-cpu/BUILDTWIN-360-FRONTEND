// src/hooks/useNotifications.ts
import { useState, useEffect, useCallback } from 'react';
import { notificationService } from '../services/notificationService';
import { Notification, NotificationSummaryDto } from '../types/notifications';

export function useNotifications(pollIntervalMs = 20000) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [badgeSummary, setBadgeSummary] = useState<NotificationSummaryDto | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const loadNotifications = useCallback(async () => {
    try {
      let username = 'admin';
      try {
        const storedUser = localStorage.getItem('buildtwin-auth-storage');
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          if (parsed.state?.user?.username) {
            username = parsed.state.user.username;
          }
        }
      } catch (e) {
        // fallback to admin
      }

      let [inboxPage, summaryData] = await Promise.all([
        notificationService.getMyInbox('UNREAD', 0, 15).catch(() => null),
        notificationService.getMySummary().catch(() => null),
      ]);

      if (!inboxPage) {
        inboxPage = await notificationService.getUserInbox(username, 'UNREAD', 0, 15).catch(() => ({ content: [] } as any));
      }

      if (!summaryData) {
        summaryData = await notificationService.getUserSummary(username).catch(() => null);
      }

      setNotifications(inboxPage?.content || []);
      if (summaryData) {
        setBadgeSummary(summaryData);
      }
    } catch (err) {
      console.error('Error fetching notification badge count', err);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
    const handleNotificationEvent = () => {
      loadNotifications();
    };
    window.addEventListener('buildtwin:notification-created', handleNotificationEvent);

    // Auto-polling for real-time background cron updates (Low stock, Overrun, SLA Breaches)
    const interval = setInterval(loadNotifications, pollIntervalMs);
    return () => {
      clearInterval(interval);
      window.removeEventListener('buildtwin:notification-created', handleNotificationEvent);
    };
  }, [loadNotifications, pollIntervalMs]);

  const markRead = async (id: number) => {
    await notificationService.markAsRead(id);
    await loadNotifications();
  };

  const markAllRead = async () => {
    const username = badgeSummary?.username || 'admin';
    await notificationService.markAllAsRead(username);
    await loadNotifications();
  };

  const archiveNotification = async (id: number) => {
    await notificationService.archiveNotification(id);
    await loadNotifications();
  };

  const deleteNotification = async (id: number) => {
    await notificationService.deleteNotification(id);
    await loadNotifications();
  };

  return {
    notifications,
    unreadCount: badgeSummary?.unreadCount || 0,
    urgentCount: badgeSummary?.urgentCount || 0,
    loading,
    markRead,
    markAllRead,
    archiveNotification,
    deleteNotification,
    refresh: loadNotifications,
  };
}
