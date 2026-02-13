import { useState, useEffect } from 'react';
import { getServices } from '../../services/firebase/service.service';
import type { ServiceModel } from '../../types/service.types';

/**
 * Custom hook for fetching user services
 * Uses useState/useEffect instead of React Query to avoid
 * "No QueryClient set" errors in lazy-loaded routes.
 */
export const useUserServices = (userId: string | undefined, userRole: string | undefined) => {
  const [data, setData] = useState<ServiceModel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!userId || userRole !== 'provider') return;

    let cancelled = false;
    const fetchServices = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const services = await getServices({ providerId: userId });
        if (!cancelled) {
          console.log('Loaded user services:', services);
          setData(services);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error('Failed to load services'));
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchServices();
    return () => { cancelled = true; };
  }, [userId, userRole]);

  return { data, isLoading, error };
};
