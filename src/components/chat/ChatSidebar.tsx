import {
  Typography,
  Box,
  List,
  Divider,
  Avatar,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Badge,
} from '@mui/material';
import { ChatBubbleOutline as ChatIcon } from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import type { ChatRoom } from '../../types/chat.types';

interface ChatSidebarProps {
  rooms: (ChatRoom & { id: string })[];
  currentUserId: string;
  selectedRoomId?: string;
  onRoomSelect: (room: ChatRoom & { id: string }) => void;
  isVisible: boolean;
}

export default function ChatSidebar({ 
  rooms, 
  currentUserId, 
  selectedRoomId,
  onRoomSelect,
  isVisible 
}: ChatSidebarProps) {
  return (
    <Box
      sx={{
        width: { xs: isVisible ? '100%' : 0, md: 360 },
        display: { xs: isVisible ? 'flex' : 'none', md: 'flex' },
        borderRight: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper',
        overflow: 'hidden',
        flexDirection: 'column',
      }}
    >
      {/* Chat List Header */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h5" fontWeight="bold">
          Messages
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {rooms.length} conversation{rooms.length !== 1 ? 's' : ''}
        </Typography>
      </Box>

      {/* Chat List */}
      <Box sx={{ flex: 1, overflowY: 'auto' }}>
        {rooms.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8, px: 2 }}>
            <ChatIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No conversations yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Start chatting with providers
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {rooms.map((room) => {
              const otherId = room.participantIds.find(id => id !== currentUserId) || '';
              const otherName = room.participantNames?.[otherId] || 'Unknown User';
              const otherAvatar = room.participantAvatars?.[otherId];
              const unreadCount = room.unreadCount?.[currentUserId] || 0;
              const isSelected = selectedRoomId === room.id;

              // Display "📷 Image" if last message is an image URL
              const displayMessage = room.lastMessage?.startsWith('http') && 
                                      (room.lastMessage.includes('cloudinary') || 
                                       room.lastMessage.includes('image') ||
                                       room.lastMessage.match(/\.(jpg|jpeg|png|gif|webp)($|\?)/i))
                                      ? '📷 Image'
                                      : room.lastMessage || 'No messages yet';

              return (
                <Box key={room.id}>
                  <ListItemButton 
                    onClick={() => onRoomSelect(room)}
                    selected={isSelected}
                    sx={{ 
                      py: 2,
                      bgcolor: isSelected ? 'action.selected' : 'transparent',
                    }}
                  >
                    <ListItemAvatar>
                      <Badge badgeContent={unreadCount} color="error">
                        <Avatar src={otherAvatar} alt={otherName}>
                          {otherName.charAt(0).toUpperCase()}
                        </Avatar>
                      </Badge>
                    </ListItemAvatar>
                    
                    <ListItemText
                      primary={otherName}
                      primaryTypographyProps={{
                        variant: 'subtitle1',
                        fontWeight: unreadCount > 0 ? 700 : 400,
                      }}
                      secondary={
                        <>
                          <Typography
                            component="span"
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              display: 'block',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              fontWeight: unreadCount > 0 ? 600 : 400,
                            }}
                          >
                            {displayMessage}
                          </Typography>
                          {room.lastMessageTime && (
                            <Typography component="span" variant="caption" color="text.secondary">
                              {formatDistanceToNow(room.lastMessageTime, { addSuffix: true })}
                            </Typography>
                          )}
                        </>
                      }
                    />
                  </ListItemButton>
                  <Divider />
                </Box>
              );
            })}
          </List>
        )}
      </Box>
    </Box>
  );
}
