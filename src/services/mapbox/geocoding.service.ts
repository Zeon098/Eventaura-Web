/**
 * Mapbox geocoding service
 */
import axios from 'axios';
import type { GeocodingResult } from '../../types/common.types';
import { logError } from '../../utils/errorHandlers';

class MapboxGeocodingService {
  private accessToken: string;
  private baseUrl = 'https://api.mapbox.com/geocoding/v5/mapbox.places';

  constructor() {
    this.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

    if (!this.accessToken) {
      throw new Error('Mapbox access token is missing');
    }
  }

  /**
   * Forward geocoding: address → coordinates
   */
  async forward(
    query: string,
    options?: {
      proximityLat?: number;
      proximityLng?: number;
      limit?: number;
    }
  ): Promise<GeocodingResult[]> {
    try {
      if (!query || query.trim().length === 0) {
        return [];
      }

      const { proximityLat, proximityLng, limit = 5 } = options || {};
      const encodedQuery = encodeURIComponent(query);

      const params: Record<string, string | number> = {
        access_token: this.accessToken,
        limit,
      };

      if (proximityLat !== undefined && proximityLng !== undefined) {
        params.proximity = `${proximityLng},${proximityLat}`;
      }

      const response = await axios.get(
        `${this.baseUrl}/${encodedQuery}.json`,
        { params }
      );

      const features = response.data.features || [];

      return features.map((feature: { place_name?: string; center: [number, number] }) => ({
        placeName: feature.place_name || '',
        latitude: feature.center[1],
        longitude: feature.center[0],
      }));
    } catch (error) {
      logError(error, 'MapboxGeocodingService.forward');
      return [];
    }
  }

  /**
   * Reverse geocoding: coordinates → address
   */
  async reverse(
    latitude: number,
    longitude: number
  ): Promise<GeocodingResult | null> {
    try {
      const params = {
        access_token: this.accessToken,
        limit: 1,
      };

      const response = await axios.get(
        `${this.baseUrl}/${longitude},${latitude}.json`,
        { params }
      );

      const features = response.data.features || [];

      if (features.length === 0) {
        return null;
      }

      const feature = features[0];

      return {
        placeName: feature.place_name || '',
        latitude: feature.center[1],
        longitude: feature.center[0],
      };
    } catch (error) {
      logError(error, 'MapboxGeocodingService.reverse');
      return null;
    }
  }
}

// Export singleton instance
export const mapboxGeocodingService = new MapboxGeocodingService();
