import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  List,
  CircularProgress,
  Alert,
  Paper,
  Divider,
  Button,
  Tabs,
  Tab,
} from '@mui/material';
import { Notifications as NotificationsIcon, DoneAll as DoneAllIcon } from '@mui/icons-material';
import { useAuth } from '../../../hooks/useAuth';
import {
  subscribeToNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '../../../services/firebase/notification.service';
import type { NotificationModel } from '../../../types/notification.types';
import NotificationItem from '../../../components/notifications/NotificationItem';
import toast from 'react-hot-toast';

type TabValue = 'all' | 'unread';

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<(NotificationModel & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<TabValue>('all');
  const [markingAllRead, setMarkingAllRead] = useState(false);

  useEffect(() => {
    if (!user?.id) return;

    setLoading(true);
    const unsubscribe = subscribeToNotifications(
      user.id,
      (updatedNotifications) => {
        setNotifications(updatedNotifications);
        setLoading(false);
      },
      (err) => {
        console.error('Error loading notifications:', err);
        setError('Failed to load notifications');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user?.id]);

  const handleNotificationClick = async (notification: NotificationModel & { id: string }) => {
    if (!notification.read) {
      try {
        await markNotificationAsRead(notification.id);
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }
    
    // Navigate based on notification type/data if needed
    if (notification.data?.bookingId) {
      // Navigate to booking detail
      // navigate(`/bookings/${notification.data.bookingId}`);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user?.id) return;

    try {
      setMarkingAllRead(true);
      await markAllNotificationsAsRead(user.id);
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast.error('Failed to mark all as read');
    } finally {
      setMarkingAllRead(false);
    }
  };

  const filteredNotifications = tab === 'unread'
    ? notifications.filter(n => !n.read)
    : notifications;

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 4 }}>
      <Container maxWidth="md">
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Notifications
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
            </Typography>
          </Box>
          
          {unreadCount > 0 && (
            <Button
              variant="outlined"
              startIcon={<DoneAllIcon />}
              onClick={handleMarkAllAsRead}
              disabled={markingAllRead}
            >
              Mark all as read
            </Button>
          )}
        </Box>

        <Paper elevation={2}>
          <Tabs
            value={tab}
            onChange={(_, newValue) => setTab(newValue)}
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab label="All" value="all" />
            <Tab label={`Unread (${unreadCount})`} value="unread" />
          </Tabs>

          {filteredNotifications.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <NotificationsIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {tab === 'unread' ? 'No unread notifications' : 'No notifications yet'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {tab === 'unread' 
                  ? 'You\'ve read all your notifications'
                  : 'You\'ll see notifications about bookings and messages here'}
              </Typography>
            </Box>
          ) : (
            <List sx={{ p: 0 }}>
              {filteredNotifications.map((notification, index) => (
                <Box key={notification.id}>
                  <NotificationItem
                    notification={notification}
                    onClick={() => handleNotificationClick(notification)}
                  />
                  {index < filteredNotifications.length - 1 && <Divider />}
                </Box>
              ))}
            </List>
          )}
        </Paper>
      </Container>
    </Box>
  );
}
