import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Avatar,
  Divider,
  ImageList,
  ImageListItem,
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  Email as EmailIcon,
  ArrowBack as BackIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getDocument } from '../../services/firebase/firestore.service';
import { getOrCreateChatRoom } from '../../services/firebase/chat.service';
import type { ServiceModel } from '../../types/service.types';
import type { AppUser } from '../../types/user.types';
import { Collections, Routes } from '../../utils/constants';
import { formatCurrency, getInitials } from '../../utils/formatters';
import BookingDialog from '../../components/bookings/BookingDialog';
import toast from 'react-hot-toast';

export default function ServiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [service, setService] = useState<ServiceModel | null>(null);
  const [provider, setProvider] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);

  useEffect(() => {
    if (id) {
      loadService(id);
    }
  }, [id]);

  const loadService = async (serviceId: string) => {
    try {
      setLoading(true);
      setError(null);

      const serviceData = await getDocument<ServiceModel>(Collections.SERVICES, serviceId);
      
      if (!serviceData) {
        setError('Service not found');
        return;
      }

      setService(serviceData);

      // Load provider details
      if (serviceData.providerId) {
        const providerData = await getDocument<AppUser>(Collections.USERS, serviceData.providerId);
        if (providerData) {
          setProvider(providerData);
        }
      }
    } catch (err) {
      console.error('Error loading service:', err);
      setError('Failed to load service details');
    } finally {
      setLoading(false);
    }
  };

  const handleBookNow = () => {
    setBookingDialogOpen(true);
  };

  const handleContactProvider = async () => {
    if (!service?.providerId || !user?.id || !provider) return;

    try {
      const roomId = await getOrCreateChatRoom(
        user.id,
        service.providerId,
        
      );
      navigate(`${Routes.CHAT}/${roomId}`);
    } catch (error) {
      console.error('Error creating chat room:', error);
      toast.error('Failed to start conversation');
    }
  };

  const handleEdit = () => {
    navigate(`${Routes.SERVICE_EDIT.replace(':id', id || '')}`);
  };

  const isOwner = user?.id === service?.providerId;

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

  console.log('Service data:', service);
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
            {service.galleryImages && service.galleryImages.length > 0 ? (
              <ImageList
                cols={1}
                gap={8}
                sx={{
                  borderRadius: 2,
                  overflow: 'hidden',
                }}
              >
               
                {service.galleryImages.map((image: string, index: number) => (
                  <ImageListItem key={index}>
                    <img
                      src={image}
                      alt={`${service.title} - ${index + 1}`}
                      style={{
                        width: '100%',
                        height: index === 0 ? '400px' : '300px',
                        objectFit: 'cover',
                        borderRadius: '8px',
                      }}
                    />
                  </ImageListItem>
                ))
                
                }
              </ImageList>
            ) : (
              <Box
                sx={{
                  width: '100%',
                  height: 400,
                  backgroundColor: 'grey.200',
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography color="text.secondary">No images available</Typography>
              </Box>
            )}
          </Grid>

          {/* Right Column - Details */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Card>
              <CardContent>
                {/* Service Name & Location */}
                <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
                  {service.title}
                </Typography>

                {service.location && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <LocationIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography color="text.secondary">
                      {service.location}
                    </Typography>
                  </Box>
                )}

                {/* Categories */}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                  {service.categories.map((category, index) => (
                    <Chip
                      key={index}
                      label={category.name}
                      color="primary"
                      variant="outlined"
                    />
                  ))}
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* Description */}
                <Typography variant="h6" gutterBottom>
                  About
                </Typography>
                <Typography variant="body1" paragraph color="text.secondary">
                  {service.description}
                </Typography>

                <Divider sx={{ my: 2 }} />

                {/* Pricing */}
                <Typography variant="h6" gutterBottom>
                  Pricing
                </Typography>
                <Box sx={{ mb: 3 }}>
                  {service.categories.map((category, index) => (
                    <Box
                      key={index}
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        mb: 1,
                      }}
                    >
                      <Typography>{category.name}</Typography>
                      <Typography color="primary" fontWeight="bold">
                        {formatCurrency(category.price)}
                        {category.pricingType !== 'base' && (
                          <Typography
                            component="span"
                            variant="caption"
                            color="text.secondary"
                          >
                            {` / ${category.pricingType === 'per_head' ? 'person' : '100 persons'}`}
                          </Typography>
                        )}
                      </Typography>
                    </Box>
                  ))}
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* Provider Info */}
                {provider && (
                  <>
                    <Typography variant="h6" gutterBottom>
                      Provider
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar
                        src={provider.photoUrl || undefined}
                        alt={provider.displayName || 'Provider'}
                        sx={{ width: 48, height: 48, mr: 2 }}
                      >
                        {getInitials(provider.displayName || provider.email)}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {provider.displayName || 'Provider'}
                        </Typography>
                        {provider.email && (
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <EmailIcon sx={{ fontSize: 14, mr: 0.5 }} />
                            <Typography variant="caption" color="text.secondary">
                              {provider.email}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </Box>

                    <Divider sx={{ my: 2 }} />
                  </>
                )}

                {/* Action Buttons */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {isOwner ? (
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<EditIcon />}
                      onClick={handleEdit}
                      fullWidth
                    >
                      Edit Service
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant="contained"
                        size="large"
                        onClick={handleBookNow}
                        fullWidth
                      >
                        Book Now
                      </Button>
                      <Button
                        variant="outlined"
                        size="large"
                        onClick={handleContactProvider}
                        fullWidth
                      >
                        Contact Provider
                      </Button>
                    </>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Booking Dialog */}
        {service && (
          <BookingDialog
            open={bookingDialogOpen}
            onClose={() => setBookingDialogOpen(false)}
            service={service}
          />
        )}
      </Container>
    </Box>
  );
}
