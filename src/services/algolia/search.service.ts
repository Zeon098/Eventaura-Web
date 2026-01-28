/**
 * Algolia search service for v5 API
 */
import { algoliasearch } from 'algoliasearch';
import type { SearchClient } from 'algoliasearch';
import type { ServiceModel, ServiceSearchHit } from '../../types/service.types';
import type { SearchFilters } from '../../types/common.types';
import { ALGOLIA_SERVICES_INDEX } from '../../utils/constants';
import { logError } from '../../utils/errorHandlers';

class AlgoliaService {
  private searchClient: SearchClient;
  private adminClient: SearchClient;

  constructor() {
    const appId = import.meta.env.VITE_ALGOLIA_APP_ID;
    const searchKey = import.meta.env.VITE_ALGOLIA_SEARCH_API_KEY;
    const adminKey = import.meta.env.VITE_ALGOLIA_ADMIN_API_KEY;

    if (!appId || !searchKey) {
      throw new Error('Algolia configuration missing');
    }

    this.searchClient = algoliasearch(appId, searchKey);
    this.adminClient = adminKey
      ? algoliasearch(appId, adminKey)
      : this.searchClient;
  }

  /**
   * Search services with pagination
   */
  async searchServices(
    query: string = '',
    filters?: SearchFilters,
    offset: number = 0,
    limit: number = 20
  ): Promise<ServiceSearchHit[]> {
    try {
      const params: string[] = [
        `hitsPerPage=${limit}`,
        `page=${Math.floor(offset / limit)}`,
      ];

      // Add geolocation search
      if (filters?.location) {
        params.push(`aroundLatLng=${filters.location.latitude},${filters.location.longitude}`);
        if (filters.radiusKm) {
          params.push(`aroundRadius=${filters.radiusKm * 1000}`);
        }
      }

      // Add price filters
      const numericFilters: string[] = [];
      if (filters?.minPrice !== undefined) {
        numericFilters.push(`price >= ${filters.minPrice}`);
      }
      if (filters?.maxPrice !== undefined) {
        numericFilters.push(`price <= ${filters.maxPrice}`);
      }
      if (numericFilters.length > 0) {
        params.push(`numericFilters=${encodeURIComponent(JSON.stringify(numericFilters))}`);
      }

      // Add category filter
      if (filters?.categories && filters.categories.length > 0) {
        // Use OR logic for multiple categories
        const categoryFilters = filters.categories
          .map(cat => `categories.id:"${cat}"`)
          .join(' OR ');
        params.push(`filters=${encodeURIComponent(categoryFilters)}`);
      } else if (filters?.category) {
        // Backward compatibility for single category
        params.push(`filters=${encodeURIComponent(`categories.id:"${filters.category}"`)}`);
      }

      const { results } = await this.searchClient.search({
        requests: [
          {
            indexName: ALGOLIA_SERVICES_INDEX,
            query: query,
            params: params.join('&'),
          },
        ],
      });

      const hits = ('hits' in results[0] ? results[0].hits : []) as ServiceSearchHit[];
      
      // Map legacy properties for backward compatibility
      return hits.map(hit => ({
        ...hit,
        name: hit.name || hit.title,
        city: hit.city || hit.location,
        images: hit.images || hit.galleryImages,
        cover_image: hit.cover_image 
      }));
    } catch (error) {
      logError(error, 'searchServices');
      return [];
    }
  }

  /**
   * Get trending services (fetch without query)
   */
  async getTrendingServices(limitCount: number = 10): Promise<ServiceSearchHit[]> {
    return this.searchServices('', undefined, 0, limitCount);
  }

  /**
   * Get nearby services
   */
  async getNearbyServices(
    latitude: number,
    longitude: number,
    radiusKm?: number,
    limitCount: number = 20
  ): Promise<ServiceSearchHit[]> {
    try {
      const params: string[] = [
        `aroundLatLng=${latitude},${longitude}`,
        `hitsPerPage=${limitCount}`,
      ];

      if (radiusKm) {
        params.push(`aroundRadius=${radiusKm * 1000}`);
      }

      const { results } = await this.searchClient.search({
        requests: [
          {
            indexName: ALGOLIA_SERVICES_INDEX,
            query: '',
            params: params.join('&'),
          },
        ],
      });

      const hits = ('hits' in results[0] ? results[0].hits : []) as ServiceSearchHit[];
      
      return hits
        .map(hit => ({
          ...hit,
          name: hit.name || hit.title,
          city: hit.city || hit.location,
          images: hit.images || hit.galleryImages,
        }))
        .filter((hit) => hit.latitude && hit.longitude);
    } catch (error) {
      logError(error, 'getNearbyServices');
      return [];
    }
  }

  /**
   * Index a service (admin operation)
   */
  async indexService(service: ServiceModel): Promise<void> {
    try {
      const record: Record<string, unknown> = {
        objectID: service.id,
        ...service,
        name: service.title, // Add legacy property
        city: service.location,
        images: service.galleryImages,
      };

      // Add geolocation if available
      if (service.latitude && service.longitude) {
        record._geoloc = {
          lat: service.latitude,
          lng: service.longitude,
        };
      }

      // Add primary price for filtering
      if (service.categories.length > 0) {
        record.price = service.categories[0].price;
      }

      await this.adminClient.saveObject({
        indexName: ALGOLIA_SERVICES_INDEX,
        body: record,
      });
    } catch (error) {
      logError(error, 'indexService');
      throw error;
    }
  }

  /**
   * Delete service from index (admin operation)
   */
  async deleteService(serviceId: string): Promise<void> {
    try {
      await this.adminClient.deleteObject({
        indexName: ALGOLIA_SERVICES_INDEX,
        objectID: serviceId,
      });
    } catch (error) {
      logError(error, 'deleteService');
      // Don't throw - service might not be indexed yet
    }
  }
}

// Export singleton instance
export const algoliaService = new AlgoliaService();
