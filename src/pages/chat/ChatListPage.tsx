import { useState, useEffect } from 'react';
import { Box, CircularProgress, Alert } from '@mui/material';
import { useAuth } from '../../hooks/useAuth';
import { useParams, useNavigate } from 'react-router-dom';
import { subscribeToChatRooms, getChatRoom, subscribeToMessages, sendMessage, markMessagesAsRead } from '../../services/firebase/chat.service';
import type { ChatRoom, ChatMessage } from '../../types/chat.types';
import { Routes } from '../../utils/constants';
import toast from 'react-hot-toast';
import ChatSidebar from '../../components/chat/ChatSidebar';
import ChatRoomView from '../../components/chat/ChatRoomView';
import ChatSkeletonLoader from '../../components/chat/ChatSkeletonLoader';
import ChatEmptyState from '../../components/chat/ChatEmptyState';

export default function ChatListPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [rooms, setRooms] = useState<(ChatRoom & { id: string })[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<(ChatRoom & { id: string }) | null>(null);
  const [messages, setMessages] = useState<(ChatMessage & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [roomLoading, setRoomLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load chat rooms
  useEffect(() => {
    if (!user?.id) return;

    const unsubscribe = subscribeToChatRooms(
      user.id,
      (updatedRooms) => {
        setRooms(updatedRooms);
        setLoading(false);
      },
      (err) => {
        console.error('Error loading chat rooms:', err);
        setError('Failed to load conversations');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user?.id]);

  // Load selected room and messages from URL param
  useEffect(() =>  {
    if (!roomId || !user?.id) {
      setSelectedRoom(null);
      setMessages([]);
      setRoomLoading(false);
      return;
    }

    setRoomLoading(true);
    const loadRoom = async () => {
      try {
        const roomData = await getChatRoom(roomId);
        if (!roomData) {
          setError('Chat room not found');
          setRoomLoading(false);
          return;
        }
        setSelectedRoom(roomData);
        await markMessagesAsRead(roomId, user.id);
        setRoomLoading(false);
      } catch (err) {
        console.error('Error loading room:', err);
        setError('Failed to load chat');
        setRoomLoading(false);
      }
    };

    loadRoom();

    const unsubscribe = subscribeToMessages(
      roomId,
      (updatedMessages) => {
        setMessages(updatedMessages);
        if (user?.id) {
          markMessagesAsRead(roomId, user.id);
        }
      },
      (err) => {
        console.error('Error loading messages:', err);
      }
    );

    return () => unsubscribe();
  }, [roomId, user?.id]);

  const handleRoomSelect = (room: ChatRoom & { id: string }) => {
    navigate(`${Routes.CHAT}/${room.id}`);
  };

  const handleSendMessage = async (text: string, imageUrl?: string) => {
    if (!user?.id || !roomId) return;

    try {
      await sendMessage(
        { 
          roomId, 
          content: imageUrl || text, 
          type: imageUrl ? 'image' : 'text'
        },
        user.id,
      );
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
      throw error;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error && rooms.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

 

  return (
    <Box sx={{ height: 'calc(100vh - 64px)', display: 'flex', overflow: 'hidden', bgcolor: 'background.default' }}>
      {/* Left Sidebar - Chat List */}
      <ChatSidebar 
        rooms={rooms}
        currentUserId={user!.id}
        selectedRoomId={roomId}
        onRoomSelect={handleRoomSelect}
        isVisible={!selectedRoom}
      />

      {/* Right Side - Chat Room */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, position: 'relative' }}>
        {roomLoading ? (
          <ChatSkeletonLoader />
        ) : selectedRoom ? (
          <ChatRoomView 
            messages={messages}
            currentUserId={user!.id}
            onSendMessage={handleSendMessage}
          />
        ) : (
          <ChatEmptyState />
        )}
      </Box>
    </Box>
  );
}
