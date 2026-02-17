import { useMemo } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useFirebaseSubscription } from '../../hooks/useFirebaseSubscription';
import {
  subscribeToNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '../../services/firebase/notification.service';
import type { NotificationModel } from '../../types/notification.types';
import toast from 'react-hot-toast';

type TabValue = 'all' | 'unread';
type TaggedNotification = NotificationModel & { id: string };

/* ── Real-time subscription → React Query cache ─────── */

export const useNotifications = (userId: string | undefined) => {
  const { data, loading, error } = useFirebaseSubscription<TaggedNotification[]>(
    ['notifications', userId],
    (onData, onError) => subscribeToNotifications(userId!, onData, onError),
    { enabled: !!userId, fallback: [] },
  );

  return { notifications: data ?? [], loading, error };
};

/* ── Derived state ──────────────────────────────────── */

export const useFilteredNotifications = (notifications: TaggedNotification[], tab: TabValue) => {
  const filteredNotifications = useMemo(
    () => (tab === 'unread' ? notifications.filter(n => !n.read) : notifications),
    [notifications, tab],
  );
  const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);
  return { filteredNotifications, unreadCount };
};

/* ── Mutations ──────────────────────────────────────── */

export const useNotificationClick = () => {
  const mutation = useMutation({
    mutationFn: (id: string) => markNotificationAsRead(id),
  });

  const handleClick = (notification: TaggedNotification) => {
    if (!notification.read) mutation.mutate(notification.id);
  };

  return { handleClick };
};

export const useMarkAllAsRead = () => {
  const mutation = useMutation({
    mutationFn: (userId: string) => markAllNotificationsAsRead(userId),
    onSuccess: () => toast.success('All notifications marked as read'),
    onError: () => toast.error('Failed to mark all as read'),
  });

  return {
    markAllRead: (userId: string) => mutation.mutate(userId),
    markingAllRead: mutation.isPending,
  };
};
