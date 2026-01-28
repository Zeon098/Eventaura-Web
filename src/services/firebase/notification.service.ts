import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  getDoc,
  serverTimestamp,
  Timestamp,
  writeBatch,
  getDocs,
} from 'firebase/firestore';
import { db } from './config';
import type { NotificationModel, CreateNotificationInput } from '../../types/notification.types';
import { Collections } from '../../utils/constants';

/**
 * Subscribe to notifications for a user
 */
export const subscribeToNotifications = (
  userId: string,
  onUpdate: (notifications: (NotificationModel & { id: string })[]) => void,
  onError?: (error: Error) => void
) => {
  const notificationsRef = collection(db, Collections.NOTIFICATIONS);
  const q = query(
    notificationsRef,
    where('userId', '==', userId)
  );
  
  return onSnapshot(
    q,
    (snapshot) => {
      const notifications = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt),
          readAt: data.readAt instanceof Timestamp ? data.readAt.toDate() : data.readAt ? new Date(data.readAt) : undefined,
        } as NotificationModel & { id: string };
      });
      // Sort in memory to avoid composite index requirement
      notifications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      onUpdate(notifications);
    },
    (error) => {
      console.error('Error subscribing to notifications:', error);
      if (onError) onError(error);
    }
  );
};

/**
 * Create a notification
 */
export const createNotification = async (input: CreateNotificationInput): Promise<string> => {
  try {
    const notificationsRef = collection(db, Collections.NOTIFICATIONS);
    
    const notification: Omit<NotificationModel, 'id'> = {
      userId: input.userId,
      type: input.type,
      title: input.title,
      message: input.message,
      data: input.data,
      read: false,
      createdAt: new Date(),
    };
    
    const docRef = await addDoc(notificationsRef, {
      ...notification,
      createdAt: serverTimestamp(),
    });
    
    return docRef.id;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

/**
 * Mark notification as read
 */
export const markNotificationAsRead = async (notificationId: string): Promise<void> => {
  try {
    const notificationRef = doc(db, Collections.NOTIFICATIONS, notificationId);
    await updateDoc(notificationRef, {
      read: true,
      readAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

/**
 * Mark all notifications as read for a user
 */
export const markAllNotificationsAsRead = async (userId: string): Promise<void> => {
  try {
    const notificationsRef = collection(db, Collections.NOTIFICATIONS);
    const q = query(
      notificationsRef,
      where('userId', '==', userId),
      where('read', '==', false)
    );
    
    const snapshot = await getDocs(q);
    const batch = writeBatch(db);
    
    snapshot.docs.forEach((document) => {
      batch.update(document.ref, {
        read: true,
        readAt: serverTimestamp(),
      });
    });
    
    await batch.commit();
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};

/**
 * Get unread notification count
 */
export const getUnreadCount = async (userId: string): Promise<number> => {
  try {
    const notificationsRef = collection(db, Collections.NOTIFICATIONS);
    const q = query(
      notificationsRef,
      where('userId', '==', userId),
      where('read', '==', false)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.size;
  } catch (error) {
    console.error('Error getting unread count:', error);
    return 0;
  }
};

/**
 * PUSH NOTIFICATION QUEUE FUNCTIONS
 * These functions add notifications to a Firestore queue that a Cloud Function processes
 */

/**
 * Send push notification for new booking request
 */
export const notifyNewBooking = async (
  providerId: string,
  bookingId: string,
  serviceTitle: string,
  consumerName?: string
): Promise<void> => {
  try {
    // Fetch provider to get FCM token
    const providerRef = doc(db, Collections.USERS, providerId);
    const providerDoc = await getDoc(providerRef);
    
    if (!providerDoc.exists()) {
      console.warn('Provider not found for notification');
      return;
    }
    
    const providerData = providerDoc.data();
    const fcmToken = providerData?.fcmToken;
    
    if (!fcmToken) {
      console.warn('Provider has no FCM token');
      return;
    }
    
    // Add to notification queue
    const queueRef = collection(db, 'notification_queue');
    await addDoc(queueRef, {
      targetToken: fcmToken,
      title: 'New Booking Request',
      body: `${consumerName || 'Someone'} requested "${serviceTitle}"`,
      data: {
        type: 'booking_new',
        bookingId,
        providerId,
      },
      createdAt: serverTimestamp(),
      processed: false,
    });
  } catch (error) {
    console.error('Error queueing new booking notification:', error);
    // Don't throw - notification failure shouldn't block booking creation
  }
};

/**
 * Send push notification for booking status change
 */
export const notifyBookingStatusChange = async (
  bookingId: string,
  consumerId: string,
  status: string,
  providerName?: string
): Promise<void> => {
  try {
    // Fetch consumer to get FCM token
    const consumerRef = doc(db, Collections.USERS, consumerId);
    const consumerDoc = await getDoc(consumerRef);
    
    if (!consumerDoc.exists()) {
      console.warn('Consumer not found for notification');
      return;
    }
    
    const consumerData = consumerDoc.data();
    const fcmToken = consumerData?.fcmToken;
    
    if (!fcmToken) {
      console.warn('Consumer has no FCM token');
      return;
    }
    
    const providerLabel = providerName || 'Provider';
    const title = status === 'accepted' 
      ? 'Booking Accepted ✅' 
      : status === 'rejected'
      ? 'Booking Update'
      : 'Booking Status Changed';
    
    const body = status === 'accepted'
      ? `${providerLabel} accepted your booking request!`
      : status === 'rejected'
      ? `${providerLabel} declined your booking request.`
      : `${providerLabel} updated your booking to ${status}.`;
    
    // Add to notification queue
    const queueRef = collection(db, 'notification_queue');
    await addDoc(queueRef, {
      targetToken: fcmToken,
      title,
      body,
      data: {
        type: 'booking_status',
        bookingId,
        status,
        consumerId,
      },
      createdAt: serverTimestamp(),
      processed: false,
    });
  } catch (error) {
    console.error('Error queueing booking status notification:', error);
    // Don't throw - notification failure shouldn't block status update
  }
};

/**
 * Send push notification for chat message (optional)
 */
export const notifyNewChatMessage = async (
  recipientId: string,
  senderName: string,
  messageContent: string,
  roomId: string
): Promise<void> => {
  try {
    // Fetch recipient to get FCM token
    const recipientRef = doc(db, Collections.USERS, recipientId);
    const recipientDoc = await getDoc(recipientRef);
    
    if (!recipientDoc.exists()) {
      console.warn('Recipient not found for notification');
      return;
    }
    
    const recipientData = recipientDoc.data();
    const fcmToken = recipientData?.fcmToken;
    
    if (!fcmToken) {
      console.warn('Recipient has no FCM token');
      return;
    }
    
    const body = messageContent.length > 100
      ? messageContent.substring(0, 100) + '...'
      : messageContent;
    
    // Add to notification queue
    const queueRef = collection(db, 'notification_queue');
    await addDoc(queueRef, {
      targetToken: fcmToken,
      title: `Message from ${senderName}`,
      body,
      data: {
        type: 'chat_message',
        roomId,
        senderId: recipientId,
      },
      createdAt: serverTimestamp(),
      processed: false,
    });
  } catch (error) {
    console.error('Error queueing chat message notification:', error);
    // Don't throw - notification failure shouldn't block message sending
  }
};

/**
 * Send push notification for provider approval/rejection
 */
export const notifyProviderApproval = async (
  userId: string,
  approved: boolean
): Promise<void> => {
  try {
    // Fetch user to get FCM token
    const userRef = doc(db, Collections.USERS, userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      console.warn('User not found for notification');
      return;
    }
    
    const userData = userDoc.data();
    const fcmToken = userData?.fcmToken;
    
    if (!fcmToken) {
      console.warn('User has no FCM token');
      return;
    }
    
    const title = approved 
      ? 'Provider Request Approved! 🎉' 
      : 'Provider Request';
    
    const body = approved
      ? 'Congratulations! You can now create services.'
      : 'Your provider request has been reviewed.';
    
    // Add to notification queue
    const queueRef = collection(db, 'notification_queue');
    await addDoc(queueRef, {
      targetToken: fcmToken,
      title,
      body,
      data: {
        type: 'provider_approval',
        approved: approved.toString(),
        userId,
      },
      createdAt: serverTimestamp(),
      processed: false,
    });
  } catch (error) {
    console.error('Error queueing provider approval notification:', error);
    // Don't throw - notification failure shouldn't block approval process
  }
};

