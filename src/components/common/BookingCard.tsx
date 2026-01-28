import { useState, useEffect } from 'react';
import {
  Card,
  Typography,
  Box,
  Chip,
} from '@mui/material';
import {
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Verified as VerifiedIcon,
  Block as BlockIcon,
  Store as StoreIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  ArrowForwardIos as ArrowIcon,
  ArrowDownward as ArrowDownwardIcon,
  ArrowUpward as ArrowUpwardIcon,
} from '@mui/icons-material';
import type { BookingModel } from '../../types/booking.types';
import { BookingStatus, Collections } from '../../utils/constants';
import { formatTime } from '../../utils/formatters';
import { getDocument } from '../../services/firebase/firestore.service';
import type { ServiceModel } from '../../types/service.types';
import type { AppUser } from '../../types/user.types';

interface BookingCardProps {
  booking: BookingModel;
  onViewDetails?: () => void;
  showDirection?: boolean;
  isIncoming?: boolean;
}

export default function BookingCard({ booking, onViewDetails, showDirection = false, isIncoming = false }: BookingCardProps) {
  const [serviceName, setServiceName] = useState<string>('Loading...');
  const [otherUserName, setOtherUserName] = useState<string>('Loading...');

  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch service name
        const service = await getDocument<ServiceModel>(Collections.SERVICES, booking.serviceId);
        setServiceName(service?.title || 'Unknown Service');

        // Fetch other user's name
        // If incoming booking: show consumer (customer)
        // If outgoing booking: show provider (service provider)
        const otherUserId = isIncoming ? booking.consumerId : booking.providerId;
        const otherUser = await getDocument<AppUser>(Collections.USERS, otherUserId);
        setOtherUserName(otherUser?.displayName || 'Unknown User');
      } catch (error) {
        console.error('Error loading booking data:', error);
      }
    };
    loadData();
  }, [booking.serviceId, booking.consumerId, booking.providerId, isIncoming]);

  const getGradient = (status: string) => {
    // Uniform gradient for all cards
    return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case BookingStatus.ACCEPTED:
        return <CheckCircleIcon sx={{ color: 'white', fontSize: 24 }} />;
      case BookingStatus.REJECTED:
        return <CancelIcon sx={{ color: 'white', fontSize: 24 }} />;
      case BookingStatus.COMPLETED:
        return <VerifiedIcon sx={{ color: 'white', fontSize: 24 }} />;
      case BookingStatus.CANCELLED:
        return <BlockIcon sx={{ color: 'white', fontSize: 24 }} />;
      default: // pending
        return <ScheduleIcon sx={{ color: 'white', fontSize: 24 }} />;
    }
  };

  const getStatusChipColor = (status: string) => {
    switch (status) {
      case BookingStatus.PENDING:
        return '#FFA726'; // Orange
      case BookingStatus.ACCEPTED:
        return '#667eea'; // Purple
      case BookingStatus.COMPLETED:
        return '#66BB6A'; // Green
      case BookingStatus.CANCELLED:
      case BookingStatus.REJECTED:
        return '#EF5350'; // Red
      default:
        return '#9E9E9E'; // Gray
    }
  };

  const formatDateDisplay = (startTime: Date) => {
    const date = new Date(startTime);
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}`;
  };

  return (
    <Card
      sx={{
        borderRadius: 3,
        overflow: 'hidden',
        background: 'white',
        border: '1px solid #e0e0e0',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        transition: 'all 0.2s ease',
        cursor: onViewDetails ? 'pointer' : 'default',
        '&:hover': { 
          boxShadow: '0 4px 12px rgba(102, 126, 234, 0.15)',
          transform: 'translateY(-2px)',
        },
      }}
      onClick={onViewDetails}
    >
      {/* Header with gradient */}
      <Box
        sx={{
          background: getGradient(booking.status),
          p: 2.5,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
        }}
      >
        <Box
          sx={{
            bgcolor: 'rgba(255,255,255,0.2)',
            borderRadius: 2,
            p: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {getStatusIcon(booking.status)}
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="body1" sx={{ color: 'white', fontWeight: 700, fontSize: '1rem' }}>
            {formatDateDisplay(booking.startTime)}
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.875rem' }}>
            {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
          </Typography>
        </Box>
        {showDirection && (
          <Chip
            icon={isIncoming ? <ArrowDownwardIcon sx={{ fontSize: 16 }} /> : <ArrowUpwardIcon sx={{ fontSize: 16 }} />}
            label={isIncoming ? 'Incoming' : 'Outgoing'}
            size="small"
            sx={{
              bgcolor: 'rgba(255,255,255,0.25)',
              color: 'white',
              fontWeight: 600,
              fontSize: '0.75rem',
              height: 28,
              '& .MuiChip-icon': {
                color: 'white',
              },
            }}
          />
        )}
        <Chip
          label={booking.status}
          size="small"
          sx={{
            bgcolor: 'rgba(255,255,255,0.95)',
            color: getStatusChipColor(booking.status),
            fontWeight: 700,
            textTransform: 'capitalize',
            fontSize: '0.75rem',
            height: 28,
          }}
        />
      </Box>

      {/* Content */}
      <Box sx={{ p: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2, gap: 1 }}>
          <StoreIcon sx={{ fontSize: 20, color: '#667eea', mt: 0.25 }} />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem', display: 'block', mb: 0.5 }}>
              Service
            </Typography>
            <Typography
              variant="body1"
              sx={{ 
                color: 'text.primary', 
                fontWeight: 600,
                fontSize: '0.95rem',
                overflow: 'hidden', 
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {serviceName}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
          {isIncoming ? (
            <PersonIcon sx={{ fontSize: 20, color: '#667eea', mt: 0.25 }} />
          ) : (
            <BusinessIcon sx={{ fontSize: 20, color: '#667eea', mt: 0.25 }} />
          )}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem', display: 'block', mb: 0.5 }}>
              {isIncoming ? 'Customer' : 'Provider'}
            </Typography>
            <Typography
              variant="body1"
              sx={{ 
                color: 'text.primary',
                fontWeight: 600,
                fontSize: '0.95rem',
                overflow: 'hidden', 
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {otherUserName}
            </Typography>
          </Box>
          <ArrowIcon sx={{ fontSize: 18, color: '#667eea', mt: 1.5 }} />
        </Box>
      </Box>
    </Card>
  );
}
