import { useEffect } from 'react';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { Provider as ReduxProvider } from 'react-redux';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { Toaster } from 'react-hot-toast';
import { theme } from './styles/theme';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';
import { publicRoutes, protectedRoutes } from './config/routes.config';
import { store } from './store/store';
import { queryClient } from './lib/queryClient';

// Wrap protected routes with ProtectedRoute component
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

// Create router
const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [
      ...publicRoutes,
      ...wrappedProtectedRoutes,
    ],
  },
]);

function App() {
  useEffect(() => {
    console.log('✅ App component mounted successfully');
  }, []);

  return (
    <ReduxProvider store={store}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <AuthProvider>
            <RouterProvider router={router} />

            {/* Toast notifications */}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  iconTheme: {
                    primary: '#5E60CE',
                    secondary: '#fff',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#EF4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </AuthProvider>
        </ThemeProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ReduxProvider>
  );
}

export default App;
