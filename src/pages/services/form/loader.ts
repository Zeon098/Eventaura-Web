import { getDocument } from '../../../services/firebase/firestore.service';
import { Collections } from '../../../utils/constants';
import type { ServiceModel } from '../../../types/service.types';

/**
 * Loader for service form page
 * Prefetches service data when editing
 */
export const serviceFormLoader = async (serviceId?: string) => {
  if (!serviceId) {
    // Creating new service, no data to prefetch
    return { mode: 'create' as const };
  }

  try {
    const serviceData = await getDocument<ServiceModel>(Collections.SERVICES, serviceId);
    
    if (!serviceData) {
      return { error: 'Service not found' };
    }

    return {
      mode: 'edit' as const,
      service: serviceData,
    };
  } catch (error) {
    console.error('Error prefetching service:', error);
    return { error: 'Failed to load service' };
  }
};
