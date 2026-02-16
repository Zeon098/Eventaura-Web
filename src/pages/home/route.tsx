import type { RouteObject } from 'react-router-dom';
import { pathKeys } from '../../config/pathKeys';


export const homeRoute: RouteObject = {
  path: pathKeys.services,
  lazy: async () => {
    // Lazy load the UI component which internally uses the loader hook
    const Component = await import('./ui').then((module) => module.default);
    return { Component };
  },
};
