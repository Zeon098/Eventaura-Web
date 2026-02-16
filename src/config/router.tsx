import { Outlet, createBrowserRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from '../lib/queryClient';
import { ProtectedRoute } from '../components/common/ProtectedRoute';
import MainLayout from '../components/layout/MainLayout';
import { publicRoutes, protectedRoutes } from './routes.config';

/**
 * Root layout that provides React Query context to all routes.
 * This is necessary because createBrowserRouter manages its own
 * React tree, so providers must be INSIDE the router to be
 * accessible by lazy-loaded route components.
 */
function QueryProvider() {
  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export function createAppRouter() {
  const wrappedProtectedRoutes = protectedRoutes.map(route => ({
    ...route,
    lazy: async () => {
      const result = await route.lazy!();
      const Component = result.Component!;
      return {
        ...result,
        Component: () => (
          <ProtectedRoute>
            <Component />
          </ProtectedRoute>
        ),
      };
    },
  }));

  return createBrowserRouter([
    {
      element: <QueryProvider />,
      children: [
        {
          element: <MainLayout />,
          children: [
            ...publicRoutes,
            ...wrappedProtectedRoutes,
          ],
        },
      ],
    },
  ]);
}
