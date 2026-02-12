import type { RouteObject } from 'react-router-dom';
import { pathKeys } from '../../../config/pathKeys';

/**
 * Home page route configuration
 * 
 * Architecture:
 * - loader.ts: Contains React Query hook (useUserServices) for data fetching
 * - ui.tsx: Pure UI component that consumes the hook from loader.ts
 * - route.tsx: Binds the UI component with lazy loading
 */
export const homeRoute: RouteObject = {
  path: pathKeys.services,
  lazy: async () => {
    // Lazy load the UI component which internally uses the loader hook
    const Component = await import('./ui').then((module) => module.default);
    return { Component };
  },
};
