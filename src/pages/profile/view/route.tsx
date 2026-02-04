import type { RouteObject } from 'react-router-dom';
import { pathKeys } from '../../../config/pathKeys';

export const profileRoute: RouteObject = {
  path: pathKeys.profile,
  lazy: async () => {
    const Component = await import('./ui').then((module) => module.default);
    return { Component };
  },
};
