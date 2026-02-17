import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { useDebounce } from '../../../hooks/useDebounce';
import { algoliaService } from '../../../services/algolia/search.service';
import type { ServiceSearchHit } from '../../../types/service.types';
import { Routes } from '../../../utils/constants';

const ITEMS_PER_PAGE = 12;

/* ── Fetcher ────────────────────────────────────────── */

async function searchServices(
  query: string,
  categories: string[],
  priceRange: number[],
  page: number,
) {
  const offset = (page - 1) * ITEMS_PER_PAGE;

  const results = await algoliaService.searchServices(
    query,
    {
      categories: categories.length > 0 ? categories : undefined,
      minPrice: priceRange[0],
      maxPrice: priceRange[1],
    },
    offset,
    ITEMS_PER_PAGE,
  );

  const services: ServiceSearchHit[] = results.map((hit) => ({
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

  const totalHits =
    results.length < ITEMS_PER_PAGE
      ? offset + results.length
      : (page + 1) * ITEMS_PER_PAGE;

  return { services, totalPages: Math.ceil(totalHits / ITEMS_PER_PAGE) };
}

/* ── Main hook ──────────────────────────────────────── */

export function useServicesList() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<number[]>([0, 100000]);
  const [tempPriceRange, setTempPriceRange] = useState<number[]>([0, 100000]);
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounce(searchQuery, 500);

  const { data, isLoading, error } = useQuery({
    queryKey: ['services', debouncedSearch, selectedCategories, priceRange, page],
    queryFn: () => searchServices(debouncedSearch, selectedCategories, priceRange, page),
    placeholderData: keepPreviousData,   // keep old list visible while next page loads
  });

  // Reset page when search/filter criteria change (via setter wrappers)
  const setSearchQueryAndReset = (q: string) => { setSearchQuery(q); setPage(1); };
  const setSelectedCategoriesAndReset = (fn: React.SetStateAction<string[]>) => {
    setSelectedCategories(fn); setPage(1);
  };
  const setPriceRangeAndReset = (fn: React.SetStateAction<number[]>) => {
    setPriceRange(fn); setPage(1);
  };

  return {
    services: data?.services ?? [],
    loading: isLoading,
    error: error?.message ?? null,
    searchQuery,
    setSearchQuery: setSearchQueryAndReset,
    selectedCategories,
    setSelectedCategories: setSelectedCategoriesAndReset,
    priceRange,
    setPriceRange: setPriceRangeAndReset,
    tempPriceRange,
    setTempPriceRange,
    showFilters,
    setShowFilters,
    page,
    setPage,
    totalPages: data?.totalPages ?? 0,
  };
}

/* ── Actions hook ───────────────────────────────────── */

export function useServicesActions(deps: {
  selectedCategories: string[];
  showFilters: boolean;
  setShowFilters: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedCategories: (fn: React.SetStateAction<string[]>) => void;
  setPriceRange: (fn: React.SetStateAction<number[]>) => void;
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
