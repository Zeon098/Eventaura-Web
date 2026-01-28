import { Box, Typography, Avatar, Paper } from '@mui/material';
import type { ChatMessage } from '../../types/chat.types';
import { format } from 'date-fns';

interface MessageBubbleProps {
  message: ChatMessage;
  isOwnMessage: boolean;
}

export default function MessageBubble({ message, isOwnMessage }: MessageBubbleProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: isOwnMessage ? 'flex-end' : 'flex-start',
        mb: 2,
      }}
    >
      {!isOwnMessage && (
        <Avatar
          src={message.senderAvatar}
          alt={message.senderName || 'User'}
          sx={{ mr: 1, width: 32, height: 32 }}
        >
          {message.senderName?.charAt(0)?.toUpperCase() || '?'}
        </Avatar>
      )}
      
      <Box sx={{ maxWidth: '70%' }}>
        {!isOwnMessage && (
          <Typography variant="caption" color="text.secondary" sx={{ ml: 1, mb: 0.5 }}>
            {message.senderName || 'Unknown'}
          </Typography>
        )}
        
        <Paper
          elevation={1}
          sx={{
            p: 1.5,
            bgcolor: isOwnMessage ? 'primary.main' : 'background.paper',
            color: isOwnMessage ? 'primary.contrastText' : 'text.primary',
            borderRadius: 2,
            borderTopRightRadius: isOwnMessage ? 0 : 2,
            borderTopLeftRadius: isOwnMessage ? 2 : 0,
          }}
        >
          {message.type === 'image' ? (
            <Box
              component="img"
              src={message.content}
              alt="Attached image"
              sx={{
                maxWidth: '100%',
                maxHeight: 300,
                borderRadius: 1,
                cursor: 'pointer',
                objectFit: 'cover',
              }}
              onClick={() => window.open(message.content, '_blank')}
            />
          ) : (
            <Typography variant="body1">{message.content}</Typography>
          )}
          
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              mt: 0.5,
              opacity: 0.7,
              textAlign: 'right',
            }}
          >
            {format(message.sentAt, 'h:mm a')}
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
}
