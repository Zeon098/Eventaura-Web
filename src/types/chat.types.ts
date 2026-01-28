/**
 * Chat message type
 */
export interface ChatMessage {
  id: string;
  roomId?: string;
  senderId: string;
  content: string;
  type: string; // 'text' | 'image'
  sentAt: Date;
  read?: boolean;
  // Client-side only (fetched from users collection)
  senderName?: string;
  senderAvatar?: string;
}

/**
 * Chat room type
 */
export interface ChatRoom {
  id: string;
  participantIds: string[]; // User IDs
  participantNames: { [userId: string]: string };
  participantAvatars?: { [userId: string]: string };
  lastMessage?: string;
  lastMessageTime?: Date;
  lastMessageSenderId?: string;
  unreadCount?: { [userId: string]: number };
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Create chat message input
 */
export interface CreateMessageInput {
  roomId: string;
  content: string;
  type?: string; // 'text' | 'image'
}

/**
 * Create chat room input
 */
export interface CreateChatRoomInput {
  participantIds: string[];
  participantNames: { [userId: string]: string };
  participantAvatars?: { [userId: string]: string };
}
