/**
 * Service operations for Firestore
 */
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  
  limit as limitQuery,
  onSnapshot,
  type Unsubscribe,
  type DocumentData,
} from 'firebase/firestore';
import { db } from './config';
import { Collections } from '../../utils/constants';
import { logError } from '../../utils/errorHandlers';
import type { ServiceModel, ServiceCategory } from '../../types/service.types';

/**
 * Get a single service by ID
 */
export const getService = async (serviceId: string): Promise<ServiceModel | null> => {
  try {
    const serviceRef = doc(db, Collections.SERVICES, serviceId);
    const serviceSnap = await getDoc(serviceRef);

    if (!serviceSnap.exists()) {
      return null;
    }

    const data = serviceSnap.data();
    return mapServiceData(serviceSnap.id, data);
  } catch (error) {
    logError(error, `getService: ${serviceId}`);
    throw error;
  }
};

/**
 * Get all services with optional filters
 */
export const getServices = async (options?: {
  providerId?: string;
  category?: string;
  limit?: number;
}): Promise<ServiceModel[]> => {
  try {
    const servicesRef = collection(db, Collections.SERVICES);
    const constraints = [];

    if (options?.providerId) {
      constraints.push(where('providerId', '==', options.providerId));
    }

    if (options?.category) {
      constraints.push(where('category', '==', options.category));
    }

    if (options?.limit) {
      constraints.push(limitQuery(options.limit));
    }

    const q = query(servicesRef, ...constraints);
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => mapServiceData(doc.id, doc.data()));
  } catch (error) {
    logError(error, 'getServices');
    throw error;
  }
};

/**
 * Subscribe to services in real-time
 */
export const subscribeToServices = (
  onUpdate: (services: ServiceModel[]) => void,
  onError: (error: Error) => void,
  options?: {
    providerId?: string;
    limit?: number;
  }
): Unsubscribe => {
  try {
    const servicesRef = collection(db, Collections.SERVICES);
    const constraints = [];

    if (options?.providerId) {
      constraints.push(where('providerId', '==', options.providerId));
    }

    if (options?.limit) {
      constraints.push(limitQuery(options.limit));
    }

    const q = query(servicesRef, ...constraints);

    return onSnapshot(
      q,
      (snapshot) => {
        const services = snapshot.docs.map(doc => mapServiceData(doc.id, doc.data()));
        onUpdate(services);
      },
      (error) => {
        logError(error, 'subscribeToServices');
        onError(error as Error);
      }
    );
  } catch (error) {
    logError(error, 'subscribeToServices setup');
    throw error;
  }
};

/**
 * Map Firestore data to ServiceModel
 */
function mapServiceData(id: string, data: DocumentData): ServiceModel {
  // Map categories array from Firestore format
  const categories: ServiceCategory[] = (data.categories || []).map((cat: ServiceCategory) => ({
    id: cat.id || '',
    name: cat.name || '',
    price: cat.price || 0,
    pricingType: cat.pricingType || 'base',
  }));

  return {
    id,
    providerId: data.providerId || '',
    title: data.title || '',
    categories,
    description: data.description || '',
    location: data.location || '',
    latitude: data.latitude,
    longitude: data.longitude,
    coverImage: data.coverImage || '',
    galleryImages: data.galleryImages || [],
    rating: data.rating || 0,
    venueSubtypes: data.venueSubtypes || [],
  };
}
