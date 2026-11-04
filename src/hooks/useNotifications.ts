// src/hooks/useNotifications.ts
import { useState, useEffect, useCallback } from 'react';
import { notificationService } from '../services/notificationService';
import { Notification, NotificationSummaryDto } from '../types/notifications';

export function useNotifications(pollIntervalMs = 15000) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [badgeSummary, setBadgeSummary] = useState<NotificationSummaryDto | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      let username = '';
      try {
        const storedAuth = localStorage.getItem('buildtwin360-auth') || localStorage.getItem('buildtwin-auth-storage');
        if (storedAuth) {
          const parsed = JSON.parse(storedAuth);
          username = parsed.state?.user?.username || parsed.user?.username || '';
        }
      } catch {
        // ignore storage parse errors
      }

      // Fetch personal inbox (all recent items) and summary counters
      let [inboxPage, summaryData] = await Promise.all([
        notificationService.getMyInbox(undefined, 0, 25).catch(() => null),
        notificationService.getMySummary().catch(() => null),
      ]);

      // Fallback by username if personal endpoint returns null
      if (!inboxPage && username) {
        inboxPage = await notificationService.getUserInbox(username, undefined, 0, 25).catch(() => ({ content: [] } as any));
      }

      if (!summaryData && username) {
        summaryData = await notificationService.getUserSummary(username).catch(() => null);
      }

      setNotifications(inboxPage?.content || []);
      if (summaryData) {
        setBadgeSummary(summaryData);
      }
    } catch (err) {
      console.error('Error fetching notification badge count', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
    const handleNotificationEvent = () => {
      loadNotifications();
    };
    window.addEventListener('buildtwin:notification-created', handleNotificationEvent);

    // Auto-polling for real-time background updates
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
    let username = badgeSummary?.username || '';
    if (!username) {
      try {
        const storedAuth = localStorage.getItem('buildtwin360-auth');
        if (storedAuth) {
          username = JSON.parse(storedAuth)?.state?.user?.username || '';
        }
      } catch {
        // ignore
      }
    }
    if (username) {
      await notificationService.markAllAsRead(username);
    }
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
    totalCount: badgeSummary?.totalNotifications || notifications.length,
    loading,
    markRead,
    markAllRead,
    archiveNotification,
    deleteNotification,
    refresh: loadNotifications,
  };
}
