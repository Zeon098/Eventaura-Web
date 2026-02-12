import { Typography, Box, Chip, Divider } from '@mui/material';
import { LocationOn as LocationIcon } from '@mui/icons-material';
import type { ServiceCategory } from '../../../types/service.types';
import { formatCurrency } from '../../../utils/formatters';

interface ServiceInfoProps {
  title: string;
  location: string;
  description: string;
  categories: ServiceCategory[];
}

export default function ServiceInfo({
  title,
  location,
  description,
  categories,
}: ServiceInfoProps) {
  return (
    <>
      {/* Service Name & Location */}
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
        {title}
      </Typography>

      {location && (
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <LocationIcon sx={{ mr: 1, color: 'text.secondary' }} />
          <Typography color="text.secondary">{location}</Typography>
        </Box>
      )}

      {/* Categories */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
        {categories.map((category, index) => (
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
        {description}
      </Typography>

      <Divider sx={{ my: 2 }} />

      {/* Pricing */}
      <Typography variant="h6" gutterBottom>
        Pricing
      </Typography>
      <Box sx={{ mb: 3 }}>
        {categories.map((category, index) => (
          <Box
            key={index}
            sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}
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
    </>
  );
}
