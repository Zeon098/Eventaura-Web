import { useState, useEffect } from 'react';
import type { SetStateAction } from 'react';
import { 
  subscribeToChatRooms, 
  getChatRoom, 
  subscribeToMessages, 
  sendMessage, 
  markMessagesAsRead 
} from '../../../services/firebase/chat.service';
import type { ChatRoom, ChatMessage } from '../../../types/chat.types';
import toast from 'react-hot-toast';

/**
 * Custom hook for subscribing to user's chat rooms in real-time
 * Handles loading, error states, and real-time updates from Firebase
 */
export const useChatRooms = (userId: string | undefined) => {
  const [rooms, setRooms] = useState<(ChatRoom & { id: string })[]>([]);
  const [loading, setLoading] = useState(!!userId);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      return;
    }

    const unsubscribe = subscribeToChatRooms(
      userId,
      (updatedRooms: SetStateAction<(ChatRoom & { id: string })[]>) => {
        setRooms(updatedRooms);
        setLoading(false);
      },
      (err: unknown) => {
        console.error('Error loading chat rooms:', err);
        setError('Failed to load conversations');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  return { rooms, loading, error };
};

/**
 * Custom hook for loading a specific chat room and its messages
 * Subscribes to real-time message updates and handles read receipts
 */
export const useChatRoomWithMessages = (roomId: string | undefined, userId: string | undefined) => {
  const [selectedRoom, setSelectedRoom] = useState<(ChatRoom & { id: string }) | null>(null);
  const [messages, setMessages] = useState<(ChatMessage & { id: string })[]>([]);
  const [roomLoading, setRoomLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!roomId || !userId) {
      return;
    }
    
    const loadRoom = async () => {
      setRoomLoading(true);
      try {
        const roomData = await getChatRoom(roomId);
        if (!roomData) {
          setError('Chat room not found');
          setRoomLoading(false);
          return;
        }
        setSelectedRoom(roomData);
        await markMessagesAsRead(roomId, userId);
        setRoomLoading(false);
      } catch (err) {
        console.error('Error loading room:', err);
        setError('Failed to load chat');
        setRoomLoading(false);
      }
    };

    loadRoom();

    // Subscribe to messages
    const unsubscribe = subscribeToMessages(
      roomId,
      (updatedMessages: SetStateAction<(ChatMessage & { id: string })[]>) => {
        setMessages(updatedMessages);
        if (userId) {
          markMessagesAsRead(roomId, userId);
        }
      },
      (err: unknown) => {
        console.error('Error loading messages:', err);
      }
    );

    return () => unsubscribe();
  }, [roomId, userId]);

  return { selectedRoom, messages, roomLoading, error };
};

/**
 * Custom hook for sending messages
 * Uses regular state management instead of React Query to avoid provider issues with lazy routes
 */
export const useSendMessage = () => {
  const [isPending, setIsPending] = useState(false);

  const mutateAsync = async ({ 
    roomId, 
    text, 
    imageUrl, 
    userId 
  }: { 
    roomId: string; 
    text: string; 
    imageUrl?: string; 
    userId: string;
  }) => {
    setIsPending(true);
    try {
      const result = await sendMessage(
        { 
          roomId, 
          content: imageUrl || text, 
          type: imageUrl ? 'image' : 'text'
        },
        userId
      );
      return result;
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
      throw error;
    } finally {
      setIsPending(false);
    }
  };

  return { mutateAsync, isPending };
};

