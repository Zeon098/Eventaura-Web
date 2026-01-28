/**
 * Application constants matching Flutter app
 */

// Firestore collection names
export const Collections = {
  USERS: 'users',
  PROVIDER_REQUESTS: 'provider_requests',
  SERVICES: 'services',
  BOOKINGS: 'bookings',
  CHATS: 'chats',
  CHAT_MESSAGES: 'chat_messages',
  NOTIFICATIONS: 'notifications',
} as const;

// Algolia
export const ALGOLIA_SERVICES_INDEX = 'services';

// Mapbox
export const MAPBOX_STYLE_LIGHT = 'mapbox://styles/mapbox/streets-v12';

// App theme colors (matching Flutter AppTheme)
export const AppColors = {
  primary: '#5E60CE',
  secondary: '#FF6B6B',
  background: '#F8F9FA',
  surface: '#FFFFFF',
  error: '#EF4444',
  textPrimary: '#1F2937',
  textSecondary: '#6B7280',
} as const;

// Responsive breakpoints
export const Breakpoints = {
  mobile: 320,
  tablet: 768,
  desktop: 1024,
  wide: 1440,
} as const;

// Route paths
export const Routes = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  SERVICES: '/services',
  SERVICE_DETAIL: '/services/:id',
  SERVICE_FORM: '/services/form',
  SERVICE_EDIT: '/services/edit/:id',
  BOOKINGS: '/bookings',
  BOOKING_DETAIL: '/bookings/:id',
  CHAT: '/chat',
  CHAT_ROOM: '/chat/:roomId',
  PROFILE: '/profile',
  BECOME_PROVIDER: '/provider/request',
  PROVIDER_REQUEST: '/provider/request',
  PROVIDER_SERVICES: '/provider/services',
  NOTIFICATIONS: '/notifications',
} as const;

// Provider statuses
export const ProviderStatus = {
  NONE: 'none',
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
} as const;

// User roles
export const UserRole = {
  USER: 'user',
  PROVIDER: 'provider',
  ADMIN: 'admin',
} as const;

// Booking statuses
export const BookingStatus = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

// Message types
export const MessageType = {
  TEXT: 'text',
  IMAGE: 'image',
} as const;

// Pricing types for service categories
export const PricingType = {
  BASE: 'base',
  PER_HEAD: 'per_head',
  PER_100_PERSONS: 'per_100_persons',
} as const;

// Service categories
export const SERVICE_CATEGORIES = [
  { id: 'venue', name: '🏛️ Venue' },
  { id: 'catering', name: '🍴 Catering' },
  { id: 'decoration', name: '🎨 Decoration' },
  { id: 'music', name: '🎵 Music & DJ' },
  { id: 'photography', name: '📸 Photography' },
  { id: 'event_planning', name: '📋 Event Planning' },
  { id: 'security', name: '🔒 Security' },
  { id: 'food', name: '🍽️ Food' },
] as const;

// Default values
export const DEFAULT_AVATAR = 'https://ui-avatars.com/api/?name=User&background=5E60CE&color=fff';
export const MAX_GALLERY_IMAGES = 5;
export const DEFAULT_PAGE_SIZE = 20;
export const NEARBY_SERVICES_RADIUS_KM = 50;
