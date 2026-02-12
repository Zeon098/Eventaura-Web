import { Container } from '@mui/material';
import { useAuth } from '../../../hooks/useAuth';
import { useServicesList, useServicesActions } from './loader';
import ServiceListHeader from '../../../components/services/list/ServiceListHeader';
import ServiceListContent from '../../../components/services/list/ServiceListContent';
import AddServiceFab from '../../../components/services/list/AddServiceFab';

export default function ServicesListPage() {
  const { user } = useAuth();

  // Data & state from loader hooks
  const list = useServicesList();
  const actions = useServicesActions({
    selectedCategories: list.selectedCategories,
    showFilters: list.showFilters,
    setShowFilters: list.setShowFilters,
    setSelectedCategories: list.setSelectedCategories,
    setPriceRange: list.setPriceRange,
    setTempPriceRange: list.setTempPriceRange,
  });

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <ServiceListHeader
        searchQuery={list.searchQuery}
        onSearchChange={list.setSearchQuery}
        showFilters={list.showFilters}
        onToggleFilters={actions.handleToggleFilters}
        selectedCategories={list.selectedCategories}
        onCategoryClick={actions.handleCategoryClick}
        tempPriceRange={list.tempPriceRange}
        onPriceRangeChange={actions.handlePriceRangeChange}
        onPriceRangeCommit={actions.handlePriceRangeCommit}
      />

      <ServiceListContent
        services={list.services}
        loading={list.loading}
        error={list.error}
        searchQuery={list.searchQuery}
        page={list.page}
        totalPages={list.totalPages}
        onPageChange={list.setPage}
        onServiceClick={actions.handleServiceClick}
      />

      {user?.role === 'provider' && <AddServiceFab />}
    </Container>
  );
}
