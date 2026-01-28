import { useState, useEffect, useMemo } from 'react';
import { Container, Typography, Box, CircularProgress, Alert, Card, Paper, Stack } from '@mui/material';
import { useAuth } from '../../hooks/useAuth';
import { subscribeToConsumerBookings, subscribeToProviderBookings, updateBookingStatus } from '../../services/firebase/booking.service';
import type { BookingModel } from '../../types/booking.types';
import { BookingStatus } from '../../utils/constants';
import BookingCard from '../../components/common/BookingCard';
import BookingStats from '../../components/bookings/BookingStats';
import BookingTabs from '../../components/bookings/BookingTabs';
import BookingDetailDialog from '../../components/bookings/BookingDetailDialog';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function BookingsListPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [allBookings, setAllBookings] = useState<(BookingModel & { isIncoming: boolean })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<(BookingModel & { isIncoming: boolean }) | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  const getStatusFilter = (tab: number): string[] => {
    switch (tab) {
      case 0: return [BookingStatus.PENDING];
      case 1: return [BookingStatus.ACCEPTED];
      case 2: return [BookingStatus.REJECTED, BookingStatus.COMPLETED, BookingStatus.CANCELLED];
      default: return [];
    }
  };

  // Filter bookings based on active tab
  const bookings = useMemo(() => {
    const statusFilter = getStatusFilter(activeTab);
    return allBookings.filter(booking => statusFilter.includes(booking.status));
  }, [allBookings, activeTab]);

  // Calculate statistics from all bookings
  const stats = useMemo(() => {
    const pending = allBookings.filter(b => b.status === BookingStatus.PENDING).length;
    const upcoming = allBookings.filter(b => b.status === BookingStatus.ACCEPTED).length;
    const completed = allBookings.filter(b => b.status === BookingStatus.COMPLETED).length;
    const history = allBookings.length - pending - upcoming;
    const total = allBookings.length;
    return { pending, upcoming, completed, history, total };
  }, [allBookings]);

  const handleViewDetails = (booking: BookingModel & { isIncoming: boolean }) => {
    setSelectedBooking(booking);
    setDetailDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDetailDialogOpen(false);
    setSelectedBooking(null);
  };

  useEffect(() => {
    if (!user?.id) return;
    

    setLoading(true); 
    setError(null);

    let combinedBookings: (BookingModel & { isIncoming: boolean })[] = [];
    let consumerLoaded = false;
    let providerLoaded = false;
    
    const updateBookings = () => {
      if (consumerLoaded && providerLoaded) {
        // Sort by creation date (newest first)
        combinedBookings.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        console.log(`Loaded ${combinedBookings.length} total bookings (incoming + outgoing):`, combinedBookings);
        setAllBookings(combinedBookings);
        setLoading(false);
      }
    };
    
    // Subscribe to consumer bookings (outgoing - bookings this user made)
    const unsubscribeConsumer = subscribeToConsumerBookings(
      user.id,
      null, // Get all statuses
      (bookingsData) => {
        const outgoingBookings = bookingsData.map(b => ({ ...b, isIncoming: false }));
        combinedBookings = combinedBookings.filter(b => b.isIncoming).concat(outgoingBookings);
        consumerLoaded = true;
        updateBookings();
      },
      (err) => {
        console.error('Error loading consumer bookings:', err);
        consumerLoaded = true;
        updateBookings();
      }
    );

    // Subscribe to provider bookings (incoming - bookings from customers)
    const unsubscribeProvider = subscribeToProviderBookings(
      user.id,
      null, // Get all statuses
      (bookingsData) => {
        const incomingBookings = bookingsData.map(b => ({ ...b, isIncoming: true }));
        combinedBookings = combinedBookings.filter(b => !b.isIncoming).concat(incomingBookings);
        providerLoaded = true;
        updateBookings();
      },
      (err) => {
        console.error('Error loading provider bookings:', err);
        providerLoaded = true;
        updateBookings();
      }
    );

    return () => {
      unsubscribeConsumer();
      unsubscribeProvider();
    };
  }, [user?.id]);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleUpdateStatus = async (bookingId: string, newStatus: string) => {
    try {
      await updateBookingStatus(bookingId, newStatus);
      handleCloseDialog();
    } catch (error) {
      console.error('Error updating booking status:', error);
      alert('Failed to update booking status');
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', py: 4 }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 800, color: '#333' }}>
            My Bookings
          </Typography>
          <Typography variant="body1" sx={{ color: '#555', fontSize: '1.1rem' }}>
            Manage and track your service bookings
          </Typography>
        </Box>

        {/* Statistics */}
        {!loading && <BookingStats stats={stats} />}

        {/* Main Content */}
        <Card sx={{ borderRadius: 3, boxShadow: '0 8px 32px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
          <Box sx={{ bgcolor: '#f8f9fa', borderBottom: 1, borderColor: 'divider' }}>
            <BookingTabs 
              activeTab={activeTab} 
              onTabChange={handleTabChange}
              counts={{ pending: stats.pending, upcoming: stats.upcoming, history: stats.history }}
            />
          </Box>

          {error && (
            <Alert severity="error" sx={{ m: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          {loading ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 12 }}>
              <CircularProgress size={48} thickness={4} />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Loading your bookings...
              </Typography>
            </Box>
          ) : (
            <Box sx={{ p: 3 }}>
              <TabPanel value={activeTab} index={activeTab}>
                {bookings.length > 0 ? (
                  <Stack spacing={2}>
                    {bookings.map((booking) => (
                      <BookingCard 
                        key={booking.id} 
                        booking={booking}
                        showDirection={true}
                        isIncoming={booking.isIncoming}
                        onViewDetails={() => handleViewDetails(booking)}
                      />
                    ))}
                  </Stack>
                ) : (
                  <Paper elevation={0} sx={{ textAlign: 'center', py: 10, bgcolor: '#f8f9fa', borderRadius: 3 }}>
                    <Typography sx={{ fontSize: 64, mb: 2 }}>
                      {activeTab === 0 ? '📋' : activeTab === 1 ? '🚀' : '📜'}
                    </Typography>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                      No bookings found
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {activeTab === 0
                        ? 'You don\'t have any pending booking requests'
                        : activeTab === 1
                        ? 'No upcoming bookings scheduled'
                        : 'Your booking history is empty'}
                    </Typography>
                  </Paper>
                )}
              </TabPanel>
            </Box>
          )}
        </Card>

        {/* Detail Dialog */}
        <BookingDetailDialog
          open={detailDialogOpen}
          booking={selectedBooking}
          onClose={handleCloseDialog}
          onUpdateStatus={handleUpdateStatus}
        />
      </Container>
    </Box>
  );
}