import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { Toaster } from 'react-hot-toast';
import { theme } from './styles/theme';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';

// Pages
import HomePage from './pages/home/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ServicesListPage from './pages/services/ServicesListPage';
import ServiceDetailPage from './pages/services/ServiceDetailPage';
import ServiceFormPage from './pages/services/ServiceFormPage';
import BookingsListPage from './pages/bookings/BookingsListPage';
import ProfilePage from './pages/profile/ProfilePage';
import ChatListPage from './pages/chat/ChatListPage';
import NotificationsPage from './pages/notifications/NotificationsPage';

function App() {
  useEffect(() => {
    console.log('✅ App component mounted successfully');
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter>
          <MainLayout>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Protected Routes */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <ServicesListPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/services"
                element={
                  <ProtectedRoute>
                    <HomePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/services/:id"
                element={
                  <ProtectedRoute>
                    <ServiceDetailPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/services/form"
                element={
                  <ProtectedRoute>
                    <ServiceFormPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/services/edit/:id"
                element={
                  <ProtectedRoute>
                    <ServiceFormPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/bookings"
                element={
                  <ProtectedRoute>
                    <BookingsListPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/chat"
                element={
                  <ProtectedRoute>
                    <ChatListPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/chat/:roomId"
                element={
                  <ProtectedRoute>
                    <ChatListPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/notifications"
                element={
                  <ProtectedRoute>
                    <NotificationsPage />
                  </ProtectedRoute>
                }
              />

              {/* Redirect all other routes to home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </MainLayout>
        </BrowserRouter>

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
  );
}

export default App;
