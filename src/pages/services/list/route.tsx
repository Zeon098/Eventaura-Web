import type { RouteObject } from 'react-router-dom';
import { pathKeys } from '../../../config/pathKeys';

/**
 * Services List route – parallel-loads loader (hooks) + ui (component).
 * The loader exports custom hooks consumed inside the UI component.
 */
export const servicesListRoute: RouteObject = {
  path: pathKeys.home,
  lazy: async () => {
    const [, UI] = await Promise.all([
      import('./loader'),
      import('./ui'),
    ]);
    return { Component: UI.default };
  },
};
