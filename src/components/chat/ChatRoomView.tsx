import { useRef, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import type { ChatMessage } from '../../types/chat.types';

interface ChatRoomViewProps {
  messages: (ChatMessage & { id: string })[];
  currentUserId: string;
  onSendMessage: (text: string, imageUrl?: string) => Promise<void>;
}

export default function ChatRoomView({ messages, currentUserId, onSendMessage }: ChatRoomViewProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change or on mount
  useEffect(() => {
    // Use setTimeout to ensure DOM has updated
    const timer = setTimeout(() => {
      if (messagesContainerRef.current) {
        messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [messages]);

  return (
    <>
      {/* Messages Area - Full height with padding at bottom for input */}
      <Box
        ref={messagesContainerRef}
        sx={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          bgcolor: 'background.default',
          p: 2,
          pb: 10,
        }}
      >
        {messages.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body2" color="text.secondary">
              No messages yet. Start the conversation!
            </Typography>
          </Box>
        ) : (
          <>
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                isOwnMessage={message.senderId === currentUserId}
              />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </Box>

      {/* Message Input - Fixed at bottom */}
      <Box 
        sx={{ 
          position: 'fixed',
          bottom: 0,
          left: { xs: 0, md: 360 },
          right: 0,
          borderTop: 1, 
          borderColor: 'divider', 
          bgcolor: 'background.paper',
          zIndex: 10,
        }}
      >
        <MessageInput onSend={onSendMessage} />
      </Box>
    </>
  );
}
