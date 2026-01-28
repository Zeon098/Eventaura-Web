/**
 * Custom hook for geolocation
 */
import { useState, useEffect } from 'react';
import type { Location } from '../types/common.types';
import { logError } from '../utils/errorHandlers';

interface GeolocationState {
  location: Location | null;
  loading: boolean;
  error: string | null;
}

export const useGeolocation = (watch: boolean = false): GeolocationState => {
  const [state, setState] = useState<GeolocationState>(() => {
    if (!navigator.geolocation) {
      return {
        location: null,
        loading: false,
        error: 'Geolocation is not supported by your browser',
      };
    }
    return {
      location: null,
      loading: true,
      error: null,
    };
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      return;
    }

    const onSuccess = (position: GeolocationPosition) => {
      setState({
        location: {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        },
        loading: false,
        error: null,
      });
    };

    const onError = (error: GeolocationPositionError) => {
      logError(error, 'useGeolocation');
      setState({
        location: null,
        loading: false,
        error: error.message,
      });
    };

    if (watch) {
      const watchId = navigator.geolocation.watchPosition(onSuccess, onError);
      return () => navigator.geolocation.clearWatch(watchId);
    } else {
      navigator.geolocation.getCurrentPosition(onSuccess, onError);
    }
  }, [watch]);

  return state;
};
