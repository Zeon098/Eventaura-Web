import type { RouteObject } from 'react-router-dom';
import { pathKeys } from '../../../config/pathKeys';

export const profileRoute: RouteObject = {
  path: pathKeys.profile,
  lazy: async () => {
    // Parallel load loader (hooks) and UI component
    const [, { default: Component }] = await Promise.all([
      import('./loader'),
      import('./ui'),
    ]);
    return { Component };
  },
};
