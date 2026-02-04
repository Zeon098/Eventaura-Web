/**
 * Route utilities
 * Helper functions for route generation
 */

import { ROUTES } from './routes';

/**
 * Generate a service detail route
 */
export const getServiceDetailRoute = (id: string): string => {
  return `/services/${id}`;
};

/**
 * Generate a service edit route
 */
export const getServiceEditRoute = (id: string): string => {
  return `/services/edit/${id}`;
};

/**
 * Generate a chat room route
 */
export const getChatRoomRoute = (roomId: string): string => {
  return `/chat/${roomId}`;
};

export { ROUTES };
