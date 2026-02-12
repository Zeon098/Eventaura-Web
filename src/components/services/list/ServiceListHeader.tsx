import { Typography, Box } from '@mui/material';
import SearchBar from '../SearchBar';
import ServiceFilters from '../ServiceFilters';

interface ServiceListHeaderProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  showFilters: boolean;
  onToggleFilters: () => void;
  selectedCategories: string[];
  onCategoryClick: (categoryId: string) => void;
  tempPriceRange: number[];
  onPriceRangeChange: (event: Event, newValue: number | number[]) => void;
  onPriceRangeCommit: (event: Event | React.SyntheticEvent, newValue: number | number[]) => void;
}

export default function ServiceListHeader({
  searchQuery,
  onSearchChange,
  showFilters,
  onToggleFilters,
  selectedCategories,
  onCategoryClick,
  tempPriceRange,
  onPriceRangeChange,
  onPriceRangeCommit,
}: ServiceListHeaderProps) {
  return (
    <>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom fontWeight={700}>
          Browse Services
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Discover and book the perfect services for your events
        </Typography>
      </Box>

      {/* Search Bar */}
      <SearchBar
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        showFilters={showFilters}
        onToggleFilters={onToggleFilters}
      />

      {/* Filters Section */}
      <ServiceFilters
        showFilters={showFilters}
        selectedCategories={selectedCategories}
        onCategoryClick={onCategoryClick}
        tempPriceRange={tempPriceRange}
        onPriceRangeChange={onPriceRangeChange}
        onPriceRangeCommit={onPriceRangeCommit}
      />
    </>
  );
}
