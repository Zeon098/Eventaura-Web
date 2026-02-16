import { useEffect, useMemo } from 'react';
import { RouterProvider } from 'react-router-dom';
import { Provider as ReduxProvider } from 'react-redux';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { ErrorBoundary } from 'react-error-boundary';
import { theme } from './styles/theme';
import { AuthProvider } from './context/AuthContext';
import { createAppRouter } from './config/router';
import { store } from './store/store';
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
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <AuthProvider>
            <RouterProvider router={router} />
            <ToastProvider />
          </AuthProvider>
        </ThemeProvider>
      </ReduxProvider>
    </ErrorBoundary>
  );
}

export default App;
