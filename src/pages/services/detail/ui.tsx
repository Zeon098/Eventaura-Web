import {Container,Box,Grid,Card,CardContent,Button,CircularProgress,Alert} from '@mui/material';
import ServiceImageGallery from '../../../components/services/details/ServiceImageGallery';
import ServiceActions from '../../../components/services/details/ServiceActions';
import ProviderInfo from '../../../components/services/details/ProviderInfo';
import ServiceInfo from '../../../components/services/details/ServiceInfo';
import BookingDialog from '../../../components/bookings/BookingDialog';
import { useServiceDetail, useServiceActions } from './loader';
import { ArrowBack as BackIcon } from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { Routes } from '../../../utils/constants';

export default function ServiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Data from loader hooks
  const { service, provider, loading, error } = useServiceDetail(id);
  const {
    isOwner,
    bookingDialogOpen,
    handleBookNow,
    handleCloseBooking,
    handleContactProvider,
    handleEdit,
  } = useServiceActions(service, provider);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !service) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{error || 'Service not found'}</Alert>
        <Button
          startIcon={<BackIcon />}
          onClick={() => navigate(Routes.HOME)}
          sx={{ mt: 2 }}
        >
          Back to Services
        </Button>
      </Container>
    );
  }

  return (
    <Box sx={{ py: 4 }}>
      <Container maxWidth="lg">
        {/* Back Button */}
        <Button
          startIcon={<BackIcon />}
          onClick={() => navigate(Routes.HOME)}
          sx={{ mb: 3 }}
        >
          Back to Services
        </Button>

        <Grid container spacing={4}>
          {/* Left Column - Images */}
          <Grid size={{ xs: 12, md: 7 }}>
            <ServiceImageGallery
              title={service.title}
              images={service.galleryImages}
            />
          </Grid>

          {/* Right Column - Details */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Card>
              <CardContent>
                <ServiceInfo
                  title={service.title}
                  location={service.location}
                  description={service.description}
                  categories={service.categories}
                />

                {provider && <ProviderInfo provider={provider} />}

                <ServiceActions
                  isOwner={isOwner}
                  onEdit={handleEdit}
                  onBookNow={handleBookNow}
                  onContactProvider={handleContactProvider}
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Booking Dialog */}
        {service && (
          <BookingDialog
            open={bookingDialogOpen}
            onClose={handleCloseBooking}
            service={service}
          />
        )}
      </Container>
    </Box>
  );
}
