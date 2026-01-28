import { Box, Typography, ListItemButton, ListItemIcon, ListItemText, Chip } from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Message as MessageIcon,
  EventNote as BookingIcon,
} from '@mui/icons-material';
import { NotificationType, type NotificationModel } from '../../types/notification.types';
import { formatDistanceToNow } from 'date-fns';

interface NotificationItemProps {
  notification: NotificationModel & { id: string };
  onClick?: () => void;
}

export default function NotificationItem({ notification, onClick }: NotificationItemProps) {
  const getIcon = () => {
    switch (notification.type) {
      case NotificationType.BOOKING_ACCEPTED:
      case NotificationType.BOOKING_COMPLETED:
        return <CheckIcon color="success" />;
      case NotificationType.BOOKING_REJECTED:
      case NotificationType.BOOKING_CANCELLED:
        return <CancelIcon color="error" />;
      case NotificationType.NEW_MESSAGE:
        return <MessageIcon color="primary" />;
      case NotificationType.BOOKING_CREATED:
      default:
        return <BookingIcon color="info" />;
    }
  };

  const getColor = () => {
    switch (notification.type) {
      case NotificationType.BOOKING_ACCEPTED:
      case NotificationType.BOOKING_COMPLETED:
        return 'success.lighter';
      case NotificationType.BOOKING_REJECTED:
      case NotificationType.BOOKING_CANCELLED:
        return 'error.lighter';
      case NotificationType.NEW_MESSAGE:
        return 'primary.lighter';
      default:
        return 'info.lighter';
    }
  };

  return (
    <ListItemButton
      onClick={onClick}
      sx={{
        py: 2,
        bgcolor: notification.read ? 'transparent' : 'action.hover',
        '&:hover': {
          bgcolor: 'action.selected',
        },
      }}
    >
      <ListItemIcon sx={{ minWidth: 48 }}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: getColor(),
          }}
        >
          {getIcon()}
        </Box>
      </ListItemIcon>
      
      <ListItemText
        primary={
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
            <Typography variant="subtitle2" fontWeight={notification.read ? 400 : 700}>
              {notification.title}
            </Typography>
            {!notification.read && (
              <Chip label="New" size="small" color="primary" sx={{ ml: 1 }} />
            )}
          </Box>
        }
        secondary={
          <>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              {notification.message}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {formatDistanceToNow(notification.createdAt, { addSuffix: true })}
            </Typography>
          </>
        }
      />
    </ListItemButton>
  );
}
