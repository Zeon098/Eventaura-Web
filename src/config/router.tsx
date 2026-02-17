import { createBrowserRouter } from 'react-router-dom';
import { ProtectedRoute } from '../components/common/ProtectedRoute';
import QueryProvider from '../components/common/QueryProvider';
import MainLayout from '../components/layout/MainLayout';
import { publicRoutes, protectedRoutes } from './routes.config';


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
