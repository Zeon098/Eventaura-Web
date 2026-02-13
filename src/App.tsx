import { useEffect, useMemo } from 'react';
import { RouterProvider } from 'react-router-dom';
import { Provider as ReduxProvider } from 'react-redux';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { theme } from './styles/theme';
import { AuthProvider } from './context/AuthContext';
import { createAppRouter } from './config/router';
import { ErrorBoundary } from 'react-error-boundary';
import { store } from './store/store';
import { queryClient } from './lib/queryClient';
import { ToastProvider } from './components/common/ToastProvider';
import { ErrorFallback } from './components/common/ErrorFallback';

function App() {
  useEffect(() => {
    console.log('✅ App component mounted successfully');
  }, []);

  const router = useMemo(() => createAppRouter(), []);

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <ReduxProvider store={store}>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <AuthProvider>
              <RouterProvider router={router} />
              <ToastProvider />
            </AuthProvider>
          </ThemeProvider>
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </ReduxProvider>
    </ErrorBoundary>
  );
}

export default App;
