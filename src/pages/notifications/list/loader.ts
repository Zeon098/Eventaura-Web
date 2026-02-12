import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  subscribeToNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '../../../services/firebase/notification.service';
import type { NotificationModel } from '../../../types/notification.types';
import toast from 'react-hot-toast';

type TabValue = 'all' | 'unread';

/**
 * Custom hook for subscribing to user's notifications in real-time
 */
export const useNotifications = (userId: string | undefined) => {
  const [notifications, setNotifications] = useState<(NotificationModel & { id: string })[]>([]);
  const [loading, setLoading] = useState(!!userId);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    const unsubscribe = subscribeToNotifications(
      userId,
      (updatedNotifications) => {
        setNotifications(updatedNotifications);
        setLoading(false);
      },
      (err) => {
        console.error('Error loading notifications:', err);
        setError('Failed to load notifications');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  return { notifications, loading, error };
};

/**
 * Derives filtered notifications and unread count based on active tab
 */
export const useFilteredNotifications = (
  notifications: (NotificationModel & { id: string })[],
  tab: TabValue
) => {
  const filteredNotifications = useMemo(
    () => (tab === 'unread' ? notifications.filter(n => !n.read) : notifications),
    [notifications, tab]
  );

  const unreadCount = useMemo(
    () => notifications.filter(n => !n.read).length,
    [notifications]
  );

  return { filteredNotifications, unreadCount };
};

/**
 * Custom hook for handling notification click (mark as read)
 */
export const useNotificationClick = () => {
  const handleClick = useCallback(async (notification: NotificationModel & { id: string }) => {
    if (!notification.read) {
      try {
        await markNotificationAsRead(notification.id);
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }
  }, []);

  return { handleClick };
};

/**
 * Custom hook for marking all notifications as read
 */
export const useMarkAllAsRead = () => {
  const [markingAllRead, setMarkingAllRead] = useState(false);

  const markAllRead = useCallback(async (userId: string) => {
    setMarkingAllRead(true);
    try {
      await markAllNotificationsAsRead(userId);
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast.error('Failed to mark all as read');
    } finally {
      setMarkingAllRead(false);
    }
  }, []);

  return { markAllRead, markingAllRead };
};
