import { getDocument } from '../../../services/firebase/firestore.service';
import { Collections } from '../../../utils/constants';
import type { ServiceModel } from '../../../types/service.types';
import type { AppUser } from '../../../types/user.types';

/**
 * Loader for service detail page
 * Prefetches service and provider data
 */
export const serviceDetailLoader = async (serviceId: string) => {
  try {
    const serviceData = await getDocument<ServiceModel>(Collections.SERVICES, serviceId);
    
    if (!serviceData) {
      return { error: 'Service not found' };
    }

    // Optionally prefetch provider data
    let providerData = null;
    if (serviceData.providerId) {
      providerData = await getDocument<AppUser>(Collections.USERS, serviceData.providerId);
    }

    return {
      service: serviceData,
      provider: providerData,
    };
  } catch (error) {
    console.error('Error prefetching service:', error);
    return { error: 'Failed to load service' };
  }
};
