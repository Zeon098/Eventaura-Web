import { useQuery } from '@tanstack/react-query';
import { getServices } from '../../../services/firebase/service.service';
import type { ServiceModel } from '../../../types/service.types';

/**
 * React Query hook for fetching user services
 * Handles data fetching, loading, and error states
 */
export const useUserServices = (userId: string | undefined, userRole: string | undefined) => {
  return useQuery<ServiceModel[], Error>({
    queryKey: ['userServices', userId],
    queryFn: async () => {
      if (!userId) {
        throw new Error('User ID is required');
      }
      const services = await getServices({ providerId: userId });
      console.log('Loaded user services:', services);
      return services;
    },
    enabled: !!userId && userRole === 'provider',
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};
