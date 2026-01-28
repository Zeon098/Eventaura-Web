import {
  collection,
  doc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from './config';
import type { ChatRoom, ChatMessage, CreateMessageInput } from '../../types/chat.types';
import { Collections } from '../../utils/constants';

/**
 * Normalize participant IDs: sort alphabetically, trim, deduplicate, remove empty
 */
const normalizeParticipantIds = (participantIds: string[]): string[] => {
  return [...new Set(participantIds)]
    .map(id => id.trim())
    .filter(id => id.length > 0)
    .sort();
};

/**
 * Create or get existing chat room between users with proper deduplication
 * This function matches the Flutter app's ensureRoom logic exactly
 */
export const ensureChatRoom = async (
  bookingId: string,
  participantIds: string[]
): Promise<string> => {
  try {
    // 1. Normalize participants: sort alphabetically, trim, deduplicate
    const normalized = normalizeParticipantIds(participantIds);
    
    if (normalized.length === 0) {
      throw new Error('Cannot create chat room without participants');
    }
    
    // 2. Search for existing room with same participants
    const roomsRef = collection(db, Collections.CHATS);
    const q = query(
      roomsRef,
      where('participantIds', 'array-contains', normalized[0])
    );
    
    const snapshot = await getDocs(q);
    
    for (const doc of snapshot.docs) {
      const room = doc.data() as ChatRoom;
      const roomParticipants = [...room.participantIds].sort();
      
      // Check if participants match exactly
      if (JSON.stringify(roomParticipants) === JSON.stringify(normalized)) {
        return doc.id;
      }
    }
    
    // 3. Create new room if none found
    const newRoom = {
      bookingId,
      participantIds: normalized,
      lastMessage: '',
      lastMessageType: 'text',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      typing: {},
    };
    
    const docRef = await addDoc(roomsRef, newRoom);
    return docRef.id;
  } catch (error) {
    console.error('Error ensuring chat room:', error);
    throw error;
  }
};

/**
 * Create or get existing chat room between users (legacy function - use ensureChatRoom instead)
 * @deprecated Use ensureChatRoom for proper deduplication
 */
export const getOrCreateChatRoom = async (
  currentUserId: string,
  otherUserId: string,
  
): Promise<string> => {
  try {
    // Use the new ensureChatRoom with a generated booking ID
    return await ensureChatRoom('direct-chat', [currentUserId, otherUserId]);
  } catch (error) {
    console.error('Error getting/creating chat room:', error);
    throw error;
  }
};

/**
 * Subscribe to chat rooms for a user with automatic deduplication
 */
export const subscribeToChatRooms = (
  userId: string,
  onUpdate: (rooms: (ChatRoom & { id: string })[]) => void,
  onError?: (error: Error) => void
) => {
  const roomsRef = collection(db, Collections.CHATS);
  const q = query(
    roomsRef,
    where('participantIds', 'array-contains', userId),
    orderBy('updatedAt', 'desc')
  );
  
  return onSnapshot(
    q,
    async (snapshot) => {
      // Collect all unique participant IDs to fetch user data
      const allParticipantIds = new Set<string>();
      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        data.participantIds?.forEach((id: string) => allParticipantIds.add(id));
      });
      
      // Fetch user display names and avatars for all participants
      const userNames = new Map<string, string>();
      const userAvatars = new Map<string, string>();
      await Promise.all(
        Array.from(allParticipantIds).map(async (participantId) => {
          try {
            const userDoc = await getDoc(doc(db, Collections.USERS, participantId));
            if (userDoc.exists()) {
              const userData = userDoc.data();
              userNames.set(participantId, userData.displayName || 'Unknown');
              if (userData.photoUrl) {
                userAvatars.set(participantId, userData.photoUrl);
              }
            }
          } catch (error) {
            console.error(`Failed to fetch user ${participantId}:`, error);
          }
        })
      );
      
      const rooms = snapshot.docs.map((doc) => {
        const data = doc.data();
        // Build participantNames and participantAvatars from fetched user data
        const participantNames: { [userId: string]: string } = {};
        const participantAvatars: { [userId: string]: string } = {};
        data.participantIds?.forEach((id: string) => {
          participantNames[id] = userNames.get(id) || 'Unknown';
          const avatar = userAvatars.get(id);
          if (avatar) {
            participantAvatars[id] = avatar;
          }
        });
        
        return {
          id: doc.id,
          ...data,
          participantNames,
          participantAvatars,
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt),
          updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(data.updatedAt),
          lastMessageTime: data.lastMessageTime instanceof Timestamp ? data.lastMessageTime.toDate() : data.lastMessageTime ? new Date(data.lastMessageTime) : undefined,
        } as ChatRoom & { id: string };
      });
      
      // Deduplicate by participant pair (as per documentation)
      const seenParticipants = new Map<string, ChatRoom & { id: string }>();
      const deduplicatedRooms: (ChatRoom & { id: string })[] = [];
      
      for (const room of rooms) {
        const sortedIds = [...room.participantIds].sort();
        const key = sortedIds.join('-');
        
        if (!seenParticipants.has(key)) {
          seenParticipants.set(key, room);
          deduplicatedRooms.push(room);
        }
      }
      
      onUpdate(deduplicatedRooms);
    },
    (error) => {
      console.error('Error subscribing to chat rooms:', error);
      if (onError) onError(error);
    }
  );
};

/**
 * Subscribe to messages in a chat room
 */
export const subscribeToMessages = (
  roomId: string,
  onUpdate: (messages: (ChatMessage & { id: string })[]) => void,
  onError?: (error: Error) => void,
  limitCount = 50
) => {
  const messagesRef = collection(db, Collections.CHAT_MESSAGES, roomId, 'messages');
  
  // Query without orderBy first, then sort in memory to avoid index issues
  const q = query(
    messagesRef,
    limit(limitCount)
  );
  
  return onSnapshot(
    q,
    async (snapshot) => {
      console.log(`Received ${snapshot.docs.length} messages for room ${roomId}`);
      
      // Collect unique sender IDs to fetch user data
      const senderIds = new Set<string>();
      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        if (data.senderId) {
          senderIds.add(data.senderId);
        }
      });
      
      // Fetch user display names for all senders
      const userNames = new Map<string, string>();
      const userAvatars = new Map<string, string>();
      await Promise.all(
        Array.from(senderIds).map(async (senderId) => {
          try {
            const userDoc = await getDoc(doc(db, Collections.USERS, senderId));
            if (userDoc.exists()) {
              const userData = userDoc.data();
              userNames.set(senderId, userData.displayName || 'Unknown');
              if (userData.photoUrl) {
                userAvatars.set(senderId, userData.photoUrl);
              }
            }
          } catch (error) {
            console.error(`Failed to fetch user ${senderId}:`, error);
          }
        })
      );
      
      const messages = snapshot.docs.map((doc) => {
        const data = doc.data();
        const senderId = data.senderId || '';
        return {
          id: doc.id,
          senderId,
          senderName: userNames.get(senderId) || 'Unknown',
          senderAvatar: userAvatars.get(senderId),
          content: data.content || '',
          type: data.type || 'text',
          read: data.read || false,
          sentAt: data.sentAt instanceof Timestamp ? data.sentAt.toDate() : new Date(data.sentAt || Date.now()),
        } as ChatMessage & { id: string };
      });
      
      // Sort in memory by sentAt ascending (chronological order)
      messages.sort((a, b) => a.sentAt.getTime() - b.sentAt.getTime());
      
      onUpdate(messages);
    },
    (error) => {
      console.error('Error subscribing to messages:', error);
      if (onError) onError(error);
    }
  );
};

/**
 * Send a message in a chat room with sender validation
 */
export const sendMessage = async (
  input: CreateMessageInput,
  senderId: string,
  
): Promise<void> => {
  try {
    // 1. Verify room exists and sender is participant
    const roomRef = doc(db, Collections.CHATS, input.roomId);
    const roomDoc = await getDoc(roomRef);
    
    if (!roomDoc.exists()) {
      throw new Error('Chat room not found');
    }
    
    const roomData = roomDoc.data() as ChatRoom;
    
    if (!roomData.participantIds.includes(senderId)) {
      throw new Error('Sender is not a participant in this room');
    }
    
    // 2. Create message
    const messagesRef = collection(db, Collections.CHAT_MESSAGES, input.roomId, 'messages');
    
    const message = {
      senderId,
      content: input.content,
      type: input.type || 'text',
      sentAt: serverTimestamp(),
      read: false,
    };
    
    await addDoc(messagesRef, message);
    
    // 3. Update room with last message info
    const otherUserId = roomData.participantIds.find(id => id !== senderId);
    
    await updateDoc(roomRef, {
      lastMessage: input.content || '[Image]',
      lastMessageTime: serverTimestamp(),
      lastMessageSenderId: senderId,
      updatedAt: serverTimestamp(),
      [`unreadCount.${otherUserId}`]: (roomData.unreadCount?.[otherUserId!] || 0) + 1,
    });
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

/**
 * Mark messages as read in a chat room
 */
export const markMessagesAsRead = async (roomId: string, userId: string): Promise<void> => {
  try {
    const roomRef = doc(db, Collections.CHATS, roomId);
    await updateDoc(roomRef, {
      [`unreadCount.${userId}`]: 0,
    });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    throw error;
  }
};

/**
 * Get chat room by ID
 */
export const getChatRoom = async (roomId: string): Promise<(ChatRoom & { id: string }) | null> => {
  try {
    const roomRef = doc(db, Collections.CHATS, roomId);
    const roomDoc = await getDoc(roomRef);
    
    if (!roomDoc.exists()) {
      return null;
    }
    
    const data = roomDoc.data();
    
    // Fetch user names and avatars for participants
    const participantNames: { [userId: string]: string } = {};
    const participantAvatars: { [userId: string]: string } = {};
    
    if (data.participantIds) {
      await Promise.all(
        data.participantIds.map(async (participantId: string) => {
          try {
            const userDoc = await getDoc(doc(db, Collections.USERS, participantId));
            if (userDoc.exists()) {
              const userData = userDoc.data();
              participantNames[participantId] = userData.displayName || 'Unknown';
              if (userData.photoUrl) {
                participantAvatars[participantId] = userData.photoUrl;
              }
            }
          } catch (error) {
            console.error(`Failed to fetch user ${participantId}:`, error);
          }
        })
      );
    }
    
    return {
      id: roomDoc.id,
      ...data,
      participantNames,
      participantAvatars,
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt),
      updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(data.updatedAt),
      lastMessageTime: data.lastMessageTime instanceof Timestamp ? data.lastMessageTime.toDate() : data.lastMessageTime ? new Date(data.lastMessageTime) : undefined,
    } as ChatRoom & { id: string };
  } catch (error) {
    console.error('Error getting chat room:', error);
    throw error;
  }
};
