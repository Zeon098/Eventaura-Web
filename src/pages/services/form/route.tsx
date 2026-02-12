import type { RouteObject } from 'react-router-dom';
import { pathKeys } from '../../../config/pathKeys';

/**
 * Service Form routes – parallel-loads loader (hooks) + ui (component).
 * The loader exports custom hooks consumed inside the UI component.
 */
export const serviceFormRoute: RouteObject = {
  path: pathKeys.serviceForm,
  lazy: async () => {
    const [, UI] = await Promise.all([
      import('./loader'),
      import('./ui'),
    ]);
    return { Component: UI.default };
  },
};

export const serviceEditRoute: RouteObject = {
  path: pathKeys.serviceEdit,
  lazy: async () => {
    const [, UI] = await Promise.all([
      import('./loader'),
      import('./ui'),
    ]);
    return { Component: UI.default };
  },
};
