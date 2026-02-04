import { algoliaService } from '../../../services/algolia/search.service';

/**
 * Loader for services list page
 * Prefetches initial services data for faster rendering
 */
export const servicesListLoader = async () => {
  try {
    // Prefetch initial page of services
    const services = await algoliaService.searchServices('', {}, 0, 12);
    
    return {
      initialServices: services,
      timestamp: Date.now(),
    };
  } catch (error) {
    console.error('Error prefetching services:', error);
    return { initialServices: [], timestamp: Date.now() };
  }
};
