import { Box, Grid, CircularProgress, Alert, Pagination } from '@mui/material';
import type { ServiceSearchHit } from '../../../types/service.types';
import ServiceCard from '../ServiceCard';
import EmptyState from '../EmptyState';

interface ServiceListContentProps {
  services: ServiceSearchHit[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onServiceClick: (serviceId: string) => void;
}

export default function ServiceListContent({
  services,
  loading,
  error,
  searchQuery,
  page,
  totalPages,
  onPageChange,
  onServiceClick,
}: ServiceListContentProps) {
  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        {error}
      </Alert>
    );
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (services.length === 0) {
    return <EmptyState searchQuery={searchQuery} />;
  }

  return (
    <>
      {/* Services Grid */}
      <Grid container spacing={1.5} sx={{ mb: 4 }}>
        {services.map((service) => (
          <ServiceCard
            key={service.id}
            service={service}
            onClick={onServiceClick}
          />
        ))}
      </Grid>

      {/* Pagination */}
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, value) => {
              onPageChange(value);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            color="primary"
            size="large"
          />
        </Box>
      )}
    </>
  );
}
