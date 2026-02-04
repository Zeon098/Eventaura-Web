import type { RouteObject } from 'react-router-dom';
import { Navigate } from 'react-router-dom';

// Import route definitions
import { loginRoute } from '../pages/auth/login/route';
import { registerRoute } from '../pages/auth/register/route';
import { servicesListRoute } from '../pages/services/list/route';
import { serviceDetailRoute } from '../pages/services/detail/route';
import { serviceFormRoute, serviceEditRoute } from '../pages/services/form/route';
import { bookingsListRoute } from '../pages/bookings/list/route';
import { profileRoute } from '../pages/profile/view/route';
import { chatListRoute, chatRoomRoute } from '../pages/chat/list/route';
import { notificationsRoute } from '../pages/notifications/list/route';
import { homeRoute } from '../pages/home/view/route';

/**
 * Public routes - accessible without authentication
 */
export const publicRoutes: RouteObject[] = [
  loginRoute,
  registerRoute,
];

/**
 * Protected routes - require authentication
 */
export const protectedRoutes: RouteObject[] = [
  servicesListRoute,
  homeRoute,
  serviceDetailRoute,
  serviceFormRoute,
  serviceEditRoute,
  bookingsListRoute,
  profileRoute,
  chatListRoute,
  chatRoomRoute,
  notificationsRoute,
];

/**
 * All application routes
 */
export const routes: RouteObject[] = [
  ...publicRoutes,
  ...protectedRoutes,
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
];
