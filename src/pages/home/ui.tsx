import React from 'react';
import { 
  Container,Typography, Button, Box,Grid,CircularProgress,Alert,Fab,
} from '@mui/material';
import { 
  Add as AddIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import ServiceCard from '../../components/services/ServiceCard';
import { useUserServices } from './loader';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Use React Query hook from loader.ts for data fetching
  const { data: services = [], isLoading: loading, error } = useUserServices(user?.id, user?.role);

  const handleCreateService = () => {
    navigate('/services/form');
  };

  const handleEditService = (serviceId: string) => {
    navigate(`/services/edit/${serviceId}`);
  };

  if (!user?.role || user.role !== 'provider') {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h4" gutterBottom>
            Welcome to Eventaura
          </Typography>
          <Typography variant="body1" color="text.secondary">
            This page is for service providers to manage their services.
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" gutterBottom fontWeight={700}>
            My Services
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage and edit your service offerings
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateService}
          size="large"
        >
          Create Service
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error.message || 'Failed to load your services'}
        </Alert>
      )}

      {/* Loading State */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : services.length > 0 ? (
        <Grid container spacing={3}>
          {services.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              onClick={handleEditService}
            />
          ))}
        </Grid>
      ) : (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h5" color="text.secondary" gutterBottom>
            No services yet
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Create your first service to start receiving bookings
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateService}
            size="large"
          >
            Create Service
          </Button>
        </Box>
      )}

      {/* Floating Action Button */}
      {services.length > 0 && (
        <Fab
          color="primary"
          aria-label="add service"
          sx={{ position: 'fixed', bottom: 24, right: 24 }}
          onClick={handleCreateService}
        >
          <AddIcon />
        </Fab>
      )}
    </Container>
  );
};

export default HomePage;
