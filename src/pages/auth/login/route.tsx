import type { RouteObject } from 'react-router-dom';
import { pathKeys } from '../../../config/pathKeys';

export const loginRoute: RouteObject = {
  path: pathKeys.login,
  lazy: async () => {
    const Component = await import('./ui').then((module) => module.default);
    return { Component };
  },
};
