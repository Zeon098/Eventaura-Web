import type { RouteObject } from 'react-router-dom';
import { pathKeys } from '../../../config/pathKeys';

export const serviceFormRoute: RouteObject = {
  path: pathKeys.serviceForm,
  lazy: async () => {
    const Component = await import('./ui').then((module) => module.default);
    return { Component };
  },
};

export const serviceEditRoute: RouteObject = {
  path: pathKeys.serviceEdit,
  lazy: async () => {
    const Component = await import('./ui').then((module) => module.default);
    return { Component };
  },
};
