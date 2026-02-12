import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDebounce } from '../../../hooks/useDebounce';
import { algoliaService } from '../../../services/algolia/search.service';
import type { ServiceSearchHit } from '../../../types/service.types';
import { Routes } from '../../../utils/constants';

const ITEMS_PER_PAGE = 12;

/**
 * Hook that manages search, filters, pagination and fetches services from Algolia.
 */
export function useServicesList() {
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

  // Reset to page 1 when search/filter criteria change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, selectedCategories, priceRange]);

  // Fetch services whenever criteria or page changes
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const offset = (page - 1) * ITEMS_PER_PAGE;

        const filters = {
          categories: selectedCategories.length > 0 ? selectedCategories : undefined,
          minPrice: priceRange[0],
          maxPrice: priceRange[1],
        };

        const results = await algoliaService.searchServices(
          debouncedSearch,
          filters,
          offset,
          ITEMS_PER_PAGE,
        );

        if (cancelled) return;

        const mappedServices: ServiceSearchHit[] = results.map((hit) => ({
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
          gallery_images: hit.gallery_images || [],
          galleryImages: hit.gallery_images || [],
          rating: hit.rating || 0,
          venueSubtypes: hit.venueSubtypes || [],
        }));

        setServices(mappedServices);

        if (results.length < ITEMS_PER_PAGE) {
          setTotalHits(offset + results.length);
        } else {
          setTotalHits((page + 1) * ITEMS_PER_PAGE);
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Error loading services:', err);
          setError('Failed to load services. Please try again.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [debouncedSearch, selectedCategories, priceRange, page]);

  const totalPages = Math.ceil(totalHits / ITEMS_PER_PAGE);

  return {
    services,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    selectedCategories,
    setSelectedCategories,
    priceRange,
    setPriceRange,
    tempPriceRange,
    setTempPriceRange,
    showFilters,
    setShowFilters,
    page,
    setPage,
    totalPages,
  };
}

/**
 * Hook that provides list-page actions (navigate, filter toggling, category clicks).
 */
export function useServicesActions(deps: {
  selectedCategories: string[];
  showFilters: boolean;
  setShowFilters: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedCategories: React.Dispatch<React.SetStateAction<string[]>>;
  setPriceRange: React.Dispatch<React.SetStateAction<number[]>>;
  setTempPriceRange: React.Dispatch<React.SetStateAction<number[]>>;
}) {
  const navigate = useNavigate();

  const handleServiceClick = (serviceId: string) => {
    navigate(`${Routes.SERVICES}/${serviceId}`);
  };

  const handleCategoryClick = (categoryId: string) => {
    deps.setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId],
    );
  };

  const handlePriceRangeChange = (_: Event, newValue: number | number[]) => {
    deps.setTempPriceRange(newValue as number[]);
  };

  const handlePriceRangeCommit = (
    _: Event | React.SyntheticEvent,
    newValue: number | number[],
  ) => {
    deps.setPriceRange(newValue as number[]);
  };

  const handleToggleFilters = () => {
    if (deps.showFilters) {
      deps.setSelectedCategories([]);
      deps.setPriceRange([0, 100000]);
      deps.setTempPriceRange([0, 100000]);
    }
    deps.setShowFilters(!deps.showFilters);
  };

  return {
    handleServiceClick,
    handleCategoryClick,
    handlePriceRangeChange,
    handlePriceRangeCommit,
    handleToggleFilters,
  };
}
