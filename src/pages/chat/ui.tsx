import { useChatRooms, useChatRoomWithMessages, useSendMessage } from './loader';
import ChatSkeletonLoader from '../../components/chat/ChatSkeletonLoader';
import ChatEmptyState from '../../components/chat/ChatEmptyState';
import ChatRoomView from '../../components/chat/ChatRoomView';
import { Box, CircularProgress, Alert } from '@mui/material';
import ChatSidebar from '../../components/chat/ChatSidebar';
import { useParams, useNavigate } from 'react-router-dom';
import type { ChatRoom } from '../../types/chat.types';
import { Routes } from '../../utils/constants';
import { useAuth } from '../../hooks/useAuth';

export default function ChatListPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Use custom hooks from loader.ts for data fetching and real-time subscriptions
  const { rooms, loading, error } = useChatRooms(user?.id);
  const { selectedRoom, messages, roomLoading, error: roomError } = useChatRoomWithMessages(roomId, user?.id);
  const sendMessageMutation = useSendMessage();

  const handleRoomSelect = (room: ChatRoom & { id: string }) => {
    navigate(`${Routes.CHAT}/${room.id}`);
  };

  const handleSendMessage = async (text: string, imageUrl?: string) => {
    if (!user?.id || !roomId) return;

    await sendMessageMutation.mutateAsync({
      roomId,
      text,
      imageUrl,
      userId: user.id,
    });
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
        <Alert severity="error">{error || roomError}</Alert>
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
