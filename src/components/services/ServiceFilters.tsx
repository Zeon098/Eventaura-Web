import { Collapse, Paper, Box, Typography, Chip, Slider } from '@mui/material';
import { SERVICE_CATEGORIES } from '../../utils/constants';

interface ServiceFiltersProps {
  showFilters: boolean;
  selectedCategories: string[];
  onCategoryClick: (categoryId: string) => void;
  tempPriceRange: number[];
  onPriceRangeChange: (_: Event, newValue: number | number[]) => void;
  onPriceRangeCommit: (_: Event | React.SyntheticEvent, newValue: number | number[]) => void;
}

export default function ServiceFilters({
  showFilters,
  selectedCategories,
  onCategoryClick,
  tempPriceRange,
  onPriceRangeChange,
  onPriceRangeCommit,
}: ServiceFiltersProps) {
  return (

    <Collapse in={showFilters} timeout={700}>
      <Paper elevation={4} sx={{ p: 3, mb: 4 }}>
        {/* Category Chips */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ mb: 1.5, fontWeight: 600 }}>
            Categories
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {SERVICE_CATEGORIES.map((category) => (
              <Chip
                key={category.id}
                label={category.name}
                onClick={() => onCategoryClick(category.id)}
                color={selectedCategories.includes(category.id) ? 'primary' : 'default'}
                variant={selectedCategories.includes(category.id) ? 'filled' : 'outlined'}
                sx={{
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: selectedCategories.includes(category.id)
                      ? 'primary.dark'
                      : 'action.hover',
                  },
                }}
              />
            ))}
          </Box>
        </Box>

        {/* Price Range Slider */}
        <Box>
          <Typography variant="subtitle1" sx={{ mb: 1.5, fontWeight: 600 }}>
            Price Range
          </Typography>
          <Box sx={{ px: 2 }}>
            <Slider
              value={tempPriceRange}
              onChange={onPriceRangeChange}
              onChangeCommitted={onPriceRangeCommit}
              valueLabelDisplay="auto"
              min={0}
              max={100000}
              step={5000}
              valueLabelFormat={(value) => `PKR ${value.toLocaleString()}`}
              marks={[
                { value: 0, label: 'PKR 0' },
                { value: 50000, label: 'PKR 50k' },
                { value: 100000, label: 'PKR 100k' },
              ]}
            />
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                mt: 1,
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Min: PKR {tempPriceRange[0].toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Max: PKR {tempPriceRange[1].toLocaleString()}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Paper>
    </Collapse>
  );
}
