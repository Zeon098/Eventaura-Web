import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  CircularProgress,
  Alert,
  Pagination,
  Fab,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

import { useDebounce } from '../../../hooks/useDebounce';
import { algoliaService } from '../../../services/algolia/search.service';
import type {   ServiceSearchHit } from '../../../types/service.types';
import { Routes } from '../../../utils/constants';
import SearchBar from '../../../components/services/SearchBar';
import ServiceFilters from '../../../components/services/ServiceFilters';
import ServiceCard from '../../../components/services/ServiceCard';
import EmptyState from '../../../components/services/EmptyState';
import { useAuth } from '../../../hooks/useAuth';

const ITEMS_PER_PAGE = 12;

export default function ServicesListPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [services, setServices] = useState<ServiceSearchHit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<number[]>([0, 100000]);
  const [tempPriceRange, setTempPriceRange] = useState<number[]>([0, 100000]);
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [totalHits, setTotalHits] = useState(0);
  
  const debouncedSearch = useDebounce(searchQuery, 500);

  useEffect(() => {
    setPage(1); // Reset to page 1 when search changes
  }, [debouncedSearch, selectedCategories, priceRange]);

  useEffect(() => {
    loadServices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, selectedCategories, priceRange, page]);

  const loadServices = async () => {
    try {
      setLoading(true);
      setError(null);

      const offset = (page - 1) * ITEMS_PER_PAGE;
      
      // Build filters
      const filters = {
        categories: selectedCategories.length > 0 ? selectedCategories : undefined,
        minPrice: priceRange[0],
        maxPrice: priceRange[1],
      };
      
      const results = await algoliaService.searchServices(
        debouncedSearch,
        filters,
        offset,
        ITEMS_PER_PAGE
      );
      
      console.log('Loaded services from Algolia:', results);
      
      // Map Algolia hits to ServiceModel
      const mappedServices: ServiceSearchHit[] = results.map(hit => ({
        objectID: hit.objectID,
        id: hit.objectID,
        providerId: hit.providerId || '',
        title: hit.title || hit.name || '',
        categories: hit.categories || [],
        description: hit.description || '',
        location: hit.location || hit.city || '',
        latitude: hit._geoloc?.lat,
        longitude: hit._geoloc?.lng,
        cover_image: hit.cover_image || '',
        coverImage: hit.cover_image || '',
        gallery_images: hit.gallery_images  || [],
        galleryImages: hit.gallery_images  || [],
        rating: hit.rating || 0,
        venueSubtypes: hit.venueSubtypes || [],
      }));
      
      setServices(mappedServices);
      
      // Set total hits for pagination (Algolia returns this in the response)
      // Since we don't have access to nbHits directly, we estimate based on results
      if (results.length < ITEMS_PER_PAGE) {
        setTotalHits(offset + results.length);
      } else {
        // If we got a full page, there might be more
        setTotalHits((page + 1) * ITEMS_PER_PAGE);
      }
    } catch (err) {
      console.error('Error loading services:', err);
      setError('Failed to load services. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(totalHits / ITEMS_PER_PAGE);

  const handleServiceClick = (serviceId: string) => {
    navigate(`${Routes.SERVICES}/${serviceId}`);
  };

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handlePriceRangeChange = (_: Event, newValue: number | number[]) => {
    setTempPriceRange(newValue as number[]);
  };

  const handlePriceRangeCommit = (_: Event | React.SyntheticEvent, newValue: number | number[]) => {
    setPriceRange(newValue as number[]);
  };

  const handleToggleFilters = () => {
    if (showFilters) {
      // Reset filters to default when closing
      setSelectedCategories([]);
      setPriceRange([0, 100000]);
      setTempPriceRange([0, 100000]);
    }
    setShowFilters(!showFilters);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
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
        onSearchChange={setSearchQuery}
        showFilters={showFilters}
        onToggleFilters={handleToggleFilters}
      />

      {/* Filters Section */}
      <ServiceFilters
        showFilters={showFilters}
        selectedCategories={selectedCategories}
        onCategoryClick={handleCategoryClick}
        tempPriceRange={tempPriceRange}
        onPriceRangeChange={handlePriceRangeChange}
        onPriceRangeCommit={handlePriceRangeCommit}
      />

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Loading State */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : services.length > 0 ? (
        <>
          {/* Services Grid */}
          <Grid container spacing={1.5} sx={{ mb: 4 }}>
            {services.map(service => (
              <ServiceCard
                key={service.id}
                service={service}
                onClick={handleServiceClick}
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
                  setPage(value);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                color="primary"
                size="large"
              />
            </Box>
          )}
        </>
      ) : (
        <EmptyState searchQuery={searchQuery} />
      )}

      {/* Add Service FAB (for providers) */}
      {user?.role === 'provider' && (
        <Fab
          color="primary"
          aria-label="add service"
          sx={{ position: 'fixed', bottom: 24, right: 24 }}
          onClick={() => navigate(Routes.SERVICE_FORM)}
        >
          <AddIcon />
        </Fab>
      )}
    </Container>
  );
}
