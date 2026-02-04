import type { RouteObject } from 'react-router-dom';
import { pathKeys } from '../../../config/pathKeys';

export const notificationsRoute: RouteObject = {
  path: pathKeys.notifications,
  lazy: async () => {
    const Component = await import('./ui').then((module) => module.default);
    return { Component };
  },
};
