import { useState } from 'react';
import { Container, Typography, Box, CircularProgress, Alert, Card, Paper, Stack } from '@mui/material';
import { useAuth } from '../../hooks/useAuth';
import type { BookingModel } from '../../types/booking.types';
import BookingCard from '../../components/common/BookingCard';
import BookingStats from '../../components/bookings/BookingStats';
import BookingTabs from '../../components/bookings/BookingTabs';
import BookingDetailDialog from '../../components/bookings/BookingDetailDialog';
import { useBookings, useFilteredBookings, useBookingStats, useUpdateBookingStatus } from './loader';

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
  const [selectedBooking, setSelectedBooking] = useState<(BookingModel & { isIncoming: boolean }) | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  // Data fetching and derived state from loader.ts
  const { allBookings, loading, error } = useBookings(user?.id);
  const bookings = useFilteredBookings(allBookings, activeTab);
  const stats = useBookingStats(allBookings);
  const { updateStatus } = useUpdateBookingStatus();

  const handleViewDetails = (booking: BookingModel & { isIncoming: boolean }) => {
    setSelectedBooking(booking);
    setDetailDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDetailDialogOpen(false);
    setSelectedBooking(null);
  };

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleUpdateStatus = async (bookingId: string, newStatus: string) => {
    await updateStatus(bookingId, newStatus);
    handleCloseDialog();
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