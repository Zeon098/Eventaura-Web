/**
 * Central export file for all Firebase services
 * Import from this file for clean imports: import { createBooking, ensureChatRoom } from '@/services/firebase'
 */

// Auth
export {
  signUp,
  signIn,
  signOut,
  getCurrentUser,
  onAuthStateChange,
  getCurrentUserId,
} from './auth.service';

// Firestore generic operations
export {
  getDocument,
  setDocument,
  updateDocument,
  deleteDocument,
  addDocument,
  queryDocuments,
  subscribeToCollection,
  subscribeToDocument,
} from './firestore.service';

// Bookings
export {
  checkBookingOverlap,
  createBooking,
  getBooking,
  updateBookingStatus,
  subscribeToConsumerBookings,
  subscribeToProviderBookings,
  getBookingsByProviderAndDate,
} from './booking.service';

// Chat
export {
  ensureChatRoom,
  getOrCreateChatRoom,
  subscribeToChatRooms,
  subscribeToMessages,
  sendMessage,
  markMessagesAsRead,
  getChatRoom,
} from './chat.service';

// Notifications
export {
  subscribeToNotifications,
  createNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getUnreadCount,
  notifyNewBooking,
  notifyBookingStatusChange,
  notifyNewChatMessage,
  notifyProviderApproval,
} from './notification.service';

// Provider Requests
export {
  submitProviderRequest,
  getProviderRequest,
  approveProviderRequest,
  rejectProviderRequest,
} from './provider-request.service';

// Firebase config
export { auth, db } from './config';
