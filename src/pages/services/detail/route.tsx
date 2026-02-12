import type { RouteObject } from 'react-router-dom';
import { pathKeys } from '../../../config/pathKeys';

/**
 * Service Detail route – parallel-loads loader (hooks) + ui (component).
 * The loader exports custom hooks consumed inside the UI component.
 */
export const serviceDetailRoute: RouteObject = {
  path: pathKeys.serviceDetail,
  lazy: async () => {
    const [, UI] = await Promise.all([
      import('./loader'),
      import('./ui'),
    ]);
    return { Component: UI.default };
  },
};
