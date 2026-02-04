/**
 * Route configuration file
 * Centralizes all route paths for easy maintenance
 */

export const ROUTES = {
  // Auth routes
  LOGIN: '/login',
  REGISTER: '/register',

  // Main routes
  HOME: '/',
  SERVICES: '/services',
  SERVICE_DETAIL: '/services/:id',
  SERVICE_FORM: '/services/form',
  SERVICE_EDIT: '/services/edit/:id',

  // Bookings
  BOOKINGS: '/bookings',

  // Profile
  PROFILE: '/profile',

  // Chat
  CHAT: '/chat',
  CHAT_ROOM: '/chat/:roomId',

  // Notifications
  NOTIFICATIONS: '/notifications',
} as const;

export type RouteKey = keyof typeof ROUTES;
export type RoutePath = typeof ROUTES[RouteKey];
