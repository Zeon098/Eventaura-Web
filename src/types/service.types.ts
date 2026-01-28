/**
 * Service category with pricing information
 */
export interface ServiceCategory {
  id: string;
  name: string;
  price: number;
  pricingType?: 'base' | 'per_head' | 'per_100_persons';
}

/**
 * Service model for event services (venues, catering, etc.)
 */
export interface ServiceModel {
  id: string;
  providerId: string;
  title: string;
  categories: ServiceCategory[];
  description: string;
  location: string;
  latitude?: number;
  longitude?: number;
  coverImage: string;
  galleryImages: string[];
  rating: number;
  venueSubtypes: string[]; // e.g., ['Outdoor', 'Indoor', 'Banquet Hall']
}

/**
 * Algolia search hit result
 */
export interface ServiceSearchHit extends ServiceModel {
  objectID: string;
  _geoloc?: {
    lat: number;
    lng: number;
  };
  // Legacy/alias properties for backward compatibility
  name?: string; // alias for title
  city?: string; // alias for location
  address?: string; // full address
  gallery_images?: string[];
  cover_image?: string; // alias for coverImage (snake_case from Algolia)
  images?: string[]; // alias for galleryImages
}
