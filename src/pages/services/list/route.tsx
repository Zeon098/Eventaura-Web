import type { RouteObject } from 'react-router-dom';
import { pathKeys } from '../../../config/pathKeys';

export const servicesListRoute: RouteObject = {
  path: pathKeys.home,
  lazy: async () => {
    const Component = await import('./ui').then((module) => module.default);
    return { Component };
  },
};
