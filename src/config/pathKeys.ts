/**
 * Route path constants
 * Central location for all route paths
 */
export const pathKeys = {
  // Auth routes
  login: '/login',
  register: '/register',

  // Main routes
  home: '/',
  services: '/services',
  serviceDetail: '/services/:id',
  serviceForm: '/services/form',
  serviceEdit: '/services/edit/:id',

  // Bookings
  bookings: '/bookings',

  // Profile
  profile: '/profile',

  // Chat
  chat: '/chat',
  chatRoom: '/chat/:roomId',

  // Notifications
  notifications: '/notifications',
} as const;
