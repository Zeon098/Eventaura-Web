/**
 * Common utility types
 */

/**
 * Geocoding result from Mapbox
 */
export interface GeocodingResult {
  placeName: string;
  latitude: number;
  longitude: number;
}

/**
 * Location coordinates
 */
export interface Location {
  latitude: number;
  longitude: number;
}

/**
 * Notification data
 */
export interface NotificationData {
  id: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  createdAt: Date;
  read: boolean;
}

/**
 * API error response
 */
export interface APIError {
  code: string;
  message: string;
  details?: unknown;
}

/**
 * Pagination params
 */
export interface PaginationParams {
  page: number;
  limit: number;
}

/**
 * Search filter params
 */
export interface SearchFilters {
  query?: string;
  category?: string;
  categories?: string[];
  minPrice?: number;
  maxPrice?: number;
  location?: Location;
  radiusKm?: number;
}
