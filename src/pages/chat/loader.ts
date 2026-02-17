import { useQuery, useMutation } from '@tanstack/react-query';
import { useFirebaseSubscription } from '../../hooks/useFirebaseSubscription';
import {
  subscribeToChatRooms,
  getChatRoom,
  subscribeToMessages,
  sendMessage,
  markMessagesAsRead,
} from '../../services/firebase/chat.service';
import type { ChatRoom, ChatMessage } from '../../types/chat.types';
import toast from 'react-hot-toast';

type TaggedRoom = ChatRoom & { id: string };
type TaggedMessage = ChatMessage & { id: string };

/* ── Chat rooms (real-time → cache) ─────────────────── */

export const useChatRooms = (userId: string | undefined) => {
  const { data, loading, error } = useFirebaseSubscription<TaggedRoom[]>(
    ['chatRooms', userId],
    (onData, onError) => subscribeToChatRooms(userId!, onData, onError),
    { enabled: !!userId, fallback: [] },
  );

  return { rooms: data ?? [], loading, error };
};

/* ── Single room + messages (real-time → cache) ─────── */

export const useChatRoomWithMessages = (roomId: string | undefined, userId: string | undefined) => {
  // Fetch room metadata once
  const { data: selectedRoom = null, isLoading: roomLoading, error } = useQuery<TaggedRoom | null>({
    queryKey: ['chatRoom', roomId],
    queryFn: async () => {
      const room = await getChatRoom(roomId!);
      if (!room) throw new Error('Chat room not found');
      if (userId) await markMessagesAsRead(roomId!, userId);
      return room;
    },
    enabled: !!roomId && !!userId,
    staleTime: 5 * 60_000,
  });

  // Subscribe to messages in real-time
  const { data: messages } = useFirebaseSubscription<TaggedMessage[]>(
    ['messages', roomId],
    (onData, onError) => subscribeToMessages(
      roomId!,
      (msgs) => { onData(msgs as TaggedMessage[]); markMessagesAsRead(roomId!, userId!); },
      onError,
    ),
    { enabled: !!roomId && !!userId, fallback: [] },
  );

  return { selectedRoom, messages: messages ?? [], roomLoading, error: error?.message ?? null };
};

/* ── Send message mutation ──────────────────────────── */

export const useSendMessage = () => {
  const mutation = useMutation({
    mutationFn: ({ roomId, text, imageUrl, userId }: {
      roomId: string; text: string; imageUrl?: string; userId: string;
    }) =>
      sendMessage(
        { roomId, content: imageUrl || text, type: imageUrl ? 'image' : 'text' },
        userId,
      ),
    onError: () => toast.error('Failed to send message'),
  });

  return { mutateAsync: mutation.mutateAsync, isPending: mutation.isPending };
};