/**
 * Notification type constants
 */
export const NotificationType = {
  BOOKING_CREATED: 'booking_created',
  BOOKING_ACCEPTED: 'booking_accepted',
  BOOKING_REJECTED: 'booking_rejected',
  BOOKING_COMPLETED: 'booking_completed',
  BOOKING_CANCELLED: 'booking_cancelled',
  NEW_MESSAGE: 'new_message',
  SERVICE_UPDATED: 'service_updated',
} as const;

export type NotificationTypeValue = typeof NotificationType[keyof typeof NotificationType];

/**
 * Notification model
 */
export interface NotificationModel {
  id: string;
  userId: string;
  type: NotificationTypeValue;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  read: boolean;
  createdAt: Date;
  readAt?: Date;
}

/**
 * Create notification input
 */
export interface CreateNotificationInput {
  userId: string;
  type: NotificationTypeValue;
  title: string;
  message: string;
  data?: Record<string, unknown>;
}
