import {
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Chip,
} from '@mui/material';
import {  LocationOn as LocationIcon } from '@mui/icons-material';
import type { ServiceModel, ServiceSearchHit  } from '../../types/service.types';
import { formatCurrency } from '../../utils/formatters';

interface ServiceCardProps {
  service: ServiceModel | ServiceSearchHit;
  onClick: (serviceId: string) => void;
}

export default function ServiceCard({ service, onClick }: ServiceCardProps) {
  const primaryCategory = service.categories[0];
  // Handle both Algolia (cover_image) and Firestore (coverImage) formats
  const imageUrl = ('cover_image' in service ? service.cover_image : service.coverImage) || 'https://via.placeholder.com/300x200';

  return (
    <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={service.id}>
      <Card
        sx={{
          height: '100%',
          width: 250,
          display: 'flex',
          flexDirection: 'column',
          transition: 'transform 0.2s, box-shadow 0.2s',
          cursor: 'pointer',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: 4,
          },
        }}
        onClick={() => onClick(service.id)}
      >
        <CardMedia
          component="img"
          image={imageUrl}
          alt={service.title}
          sx={{
            width: 250,
            height: 200,
            objectFit: 'cover',
          }}
        />
        <CardContent sx={{ flex: 1 }}>
          <Typography variant="h6" gutterBottom noWrap>
            {service.title}
          </Typography>

          {service.location && (
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <LocationIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary">
                {service.location}
              </Typography>
            </Box>
          )}

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
            {service.categories?.slice(0, 2).map((cat, index) => (
              <Chip
                key={index}
                label={cat.name}
                size="small"
                color="primary"
                variant="outlined"
              />
            ))}
            {service.categories && service.categories.length > 2 && (
              <Chip
                label={`+${service.categories.length - 2}`}
                size="small"
                variant="outlined"
              />
            )}
          </Box>

          {primaryCategory?.price && (
            <Typography variant="h6" color="primary">
              {formatCurrency(primaryCategory.price)}
              {primaryCategory.pricingType !== 'base' && (
                <Typography component="span" variant="caption" color="text.secondary">
                  {` / ${primaryCategory.pricingType === 'per_head' ? 'person' : '100 persons'}`}
                </Typography>
              )}
            </Typography>
          )}
        </CardContent>
        
      </Card>
    </Grid>
  );
}
