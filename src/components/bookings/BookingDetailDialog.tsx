import { Dialog, DialogContent, DialogActions, Button, Chip, Box, Typography, Avatar, Stack, Divider } from '@mui/material';
import type { BookingModel } from '../../types/booking.types';
import { BookingStatus } from '../../utils/constants';
import { formatTime, formatCurrency } from '../../utils/formatters';
import EnhancedInfoRow from './EnhancedInfoRow';
import ServiceInfoRow from './ServiceInfoRow';
import UserInfoRow from './UserInfoRow';

interface BookingDetailDialogProps {
  open: boolean;
  booking: (BookingModel & { isIncoming: boolean }) | null;
  onClose: () => void;
  onUpdateStatus: (bookingId: string, newStatus: string) => void;
}

function formatBookingDate(startTime: Date) {
  const date = new Date(startTime);
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

export default function BookingDetailDialog({ open, booking, onClose, onUpdateStatus }: BookingDetailDialogProps) {
  if (!booking) return null;

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          overflow: 'hidden',
        }
      }}
    >
      {/* Enhanced Header */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          p: 3,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={2}>
          <Avatar
            sx={{
              bgcolor: 'rgba(255,255,255,0.2)',
              width: 56,
              height: 56,
            }}
          >
            <Typography sx={{ fontSize: 32 }}>📋</Typography>
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h5" sx={{ color: 'white', fontWeight: 700, mb: 0.5 }}>
              Booking Details
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
              {booking.isIncoming ? 'Incoming Request' : 'Your Booking'}
            </Typography>
          </Box>
          <Chip
            label={booking.status}
            sx={{
              bgcolor: 'rgba(255,255,255,0.95)',
              color: '#667eea',
              fontWeight: 700,
              textTransform: 'capitalize',
              fontSize: '0.875rem',
              height: 32,
            }}
          />
        </Stack>
      </Box>

      <DialogContent sx={{ p: 3 }}>
        <Stack spacing={2.5}>
          {/* Date & Time */}
          <Box 
            sx={{ 
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
              gap: 2,
            }}
          >
            <EnhancedInfoRow 
              icon="📅" 
              label="Date" 
              value={formatBookingDate(booking.startTime)}
              bgcolor="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
            />
            <EnhancedInfoRow 
              icon="⏰" 
              label="Time" 
              value={`${formatTime(booking.startTime)} - ${formatTime(booking.endTime)}`}
              bgcolor="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
            />
          </Box>

          <Divider />

          {/* Service Info */}
          <Box >
            <ServiceInfoRow serviceId={booking.serviceId} />
          </Box>

          <Divider />

          {/* User Info */}
          <Box >
            <UserInfoRow 
              userId={booking.isIncoming ? booking.consumerId : booking.providerId}
              isProvider={booking.isIncoming}
            />
          </Box>

          {booking.categoryNames && booking.categoryNames.length > 0 && (
            <>
              <Divider />
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, mb: 1, display: 'block' }}>
                  Categories
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {booking.categoryNames.map((name, idx) => (
                    <Chip 
                      key={idx} 
                      label={name} 
                      size="small"
                      sx={{
                        bgcolor: '#f0f0f0',
                        fontWeight: 500,
                      }}
                    />
                  ))}
                </Stack>
              </Box>
            </>
          )}

          {booking.totalPrice && (
            <>
              <Divider />
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, mb: 0.5, display: 'block' }}>
                  Total Price
                </Typography>
                <Typography variant="h4" sx={{ color: '#667eea', fontWeight: 800 }}>
                  {formatCurrency(booking.totalPrice)}
                </Typography>
              </Box>
            </>
          )}
        </Stack>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ p: 2.5, bgcolor: '#f8f9fa' }}>
        <Stack direction="row" spacing={1.5} sx={{ width: '100%' }}>
          {booking.isIncoming && booking.status === BookingStatus.PENDING && (
            <>
              <Button 
                onClick={() => onUpdateStatus(booking.id, BookingStatus.ACCEPTED)}
                variant="contained"
                startIcon={<Typography>✅</Typography>}
                fullWidth
                size="large"
                sx={{
                  bgcolor: '#10b981',
                  '&:hover': { bgcolor: '#059669' },
                  py: 1.5,
                  fontWeight: 700,
                  textTransform: 'none',
                  fontSize: '1rem',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                }}
              >
                Accept
              </Button>
              <Button 
                onClick={() => onUpdateStatus(booking.id, BookingStatus.REJECTED)}
                variant="outlined"
                startIcon={<Typography>❌</Typography>}
                fullWidth
                size="large"
                sx={{
                  borderColor: '#ef4444',
                  color: '#ef4444',
                  '&:hover': { 
                    borderColor: '#dc2626',
                    bgcolor: 'rgba(239, 68, 68, 0.04)',
                  },
                  py: 1.5,
                  fontWeight: 700,
                  textTransform: 'none',
                  fontSize: '1rem',
                }}
              >
                Reject
              </Button>
            </>
          )}
          {booking.isIncoming && booking.status === BookingStatus.ACCEPTED && (
            <Button 
              onClick={() => onUpdateStatus(booking.id, BookingStatus.COMPLETED)}
              variant="contained"
              startIcon={<Typography>✔️</Typography>}
              fullWidth
              size="large"
              sx={{
                bgcolor: '#667eea',
                '&:hover': { bgcolor: '#5568d3' },
                py: 1.5,
                fontWeight: 700,
                textTransform: 'none',
                fontSize: '1rem',
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
              }}
            >
              Mark as Completed
            </Button>
          )}
          {!booking.isIncoming && booking.status === BookingStatus.PENDING && (
            <Button 
              onClick={() => onUpdateStatus(booking.id, BookingStatus.CANCELLED)}
              variant="contained"
              startIcon={<Typography>🚫</Typography>}
              fullWidth
              size="large"
              sx={{
                bgcolor: '#ef4444',
                '&:hover': { bgcolor: '#dc2626' },
                py: 1.5,
                fontWeight: 700,
                textTransform: 'none',
                fontSize: '1rem',
                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
              }}
            >
              Cancel Booking
            </Button>
          )}
          {(booking.status !== BookingStatus.PENDING && 
            !(booking.isIncoming && booking.status === BookingStatus.ACCEPTED)) && (
            <Button 
              onClick={onClose} 
              fullWidth 
              variant="contained"
              size="large"
              sx={{
                bgcolor: '#667eea',
                '&:hover': { bgcolor: '#5568d3' },
                py: 1.5,
                fontWeight: 700,
                textTransform: 'none',
                fontSize: '1rem',
              }}
            >
              Close
            </Button>
          )}
        </Stack>
      </DialogActions>
    </Dialog>
  );
}
