import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Box,
  Container,
  useScrollTrigger,
  Badge,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  AccountCircle,
  Login as LoginIcon,
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Routes } from '../../utils/constants';
import { subscribeToNotifications } from '../../services/firebase/notification.service';

export default function TopNavbar() {
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 0,
  });
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [mobileMenuAnchor, setMobileMenuAnchor] = useState<null | HTMLElement>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  // Subscribe to notifications for unread count
  useEffect(() => {
    if (!user?.id) return;

    const unsubscribe = subscribeToNotifications(
      user.id,
      (notifications) => {
        const count = notifications.filter(n => !n.read).length;
        setUnreadCount(count);
      }
    );

    return () => unsubscribe();
  }, [user?.id]);

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMobileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMobileMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMobileMenuAnchor(null);
  };

  const handleLogout = async () => {
    handleMenuClose();
    await signOut();
    navigate(Routes.LOGIN);
  };

  const handleNavigation = (path: string) => {
    handleMenuClose();
    navigate(path);
  };

  const navLinks: Array<{ label: string; path: string }> = [
    { label: 'Home', path: Routes.HOME },
    { label: 'Chat', path: Routes.CHAT },
     { label: 'Bookings', path: Routes.BOOKINGS },
    
  ];

  if (user?.isProvider) {
    navLinks.push({ label: 'Services', path: Routes.SERVICES },);
  }

  return (
    <>
      <AppBar
        position="fixed"
        elevation={trigger ? 4 : 0}
        sx={{
          backgroundColor: 'background.paper',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
        >
          <Container maxWidth="xl">
            <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
              {/* Logo */}
              <Box
                component={Link}
                to={Routes.HOME}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  textDecoration: 'none',
                  color: 'inherit',
                }}
              >
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 700,
                    color: 'primary.main',
                    letterSpacing: '-0.5px',
                  }}
                >
                  Eventaura
                </Typography>
              </Box>

              {/* Desktop Navigation */}
              <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1, alignItems: 'center' }}>
                {user ? (
                  <>
                    {navLinks.map((link) => (
                      <Button
                        key={link.path}
                        component={Link}
                        to={link.path}
                        sx={{
                          color: 'text.primary',
                          '&:hover': {
                            backgroundColor: 'action.hover',
                          },
                        }}
                      >
                        {link.label}
                      </Button>
                    ))}
                    {user.isProvider && (
                      <Button
                        component={Link}
                        to={Routes.SERVICE_FORM}
                        variant="contained"
                        size="small"
                      >
                        Create Service
                      </Button>
                    )}
                  </>
                ) : (
                  <>
                    <Button component={Link} to={Routes.HOME} color="inherit">
                      Home
                    </Button>
                    <Button component={Link} to={Routes.SERVICES} color="inherit">
                      Browse Services
                    </Button>
                  </>
                )}
              </Box>

              {/* Right Side Actions */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {user ? (
                  <>
                    {/* Notifications */}
                    <IconButton
                      color="inherit"
                      onClick={() => navigate(Routes.NOTIFICATIONS)}
                      sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
                    >
                      <Badge badgeContent={unreadCount} color="error">
                        <NotificationsIcon  color= 'action' />
                      </Badge>
                    </IconButton>

                    {/* Profile Menu */}
                    <IconButton
                      onClick={handleProfileMenuOpen}
                      sx={{ display: { xs: 'none', md: 'inline-flex' } }}
                    >
                      <Avatar
                        src={user.photoUrl || undefined}
                        alt={user.displayName || 'User'}
                        sx={{ width: 32, height: 32 }}
                      >
                        {!user.photoUrl && <AccountCircle />}
                      </Avatar>
                    </IconButton>

                    {/* Mobile Menu */}
                    <IconButton
                      onClick={handleMobileMenuOpen}
                      sx={{ display: { xs: 'inline-flex', md: 'none' } }}
                    >
                      <MenuIcon />
                    </IconButton>
                  </>
                ) : (
                  <>
                    <Button
                      component={Link}
                      to={Routes.LOGIN}
                      startIcon={<LoginIcon />}
                      variant="outlined"
                      sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
                    >
                      Login
                    </Button>
                    <Button
                      component={Link}
                      to={Routes.REGISTER}
                      variant="contained"
                    >
                      Sign Up
                    </Button>
                  </>
                )}
              </Box>
            </Toolbar>
          </Container>
        </AppBar>

      {/* Spacer to push content below fixed navbar */}
      <Toolbar />

      {/* Desktop Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem disabled>
          <Typography variant="body2" color="text.secondary">
            {user?.email}
          </Typography>
        </MenuItem>
        <MenuItem onClick={() => handleNavigation(Routes.PROFILE)}>
          My Profile
        </MenuItem>
        {user?.isProvider && (
          <MenuItem onClick={() => handleNavigation(Routes.PROVIDER_SERVICES)}>
            My Services
          </MenuItem>
        )}
        <MenuItem onClick={() => handleNavigation(Routes.BOOKINGS)}>
          My Bookings
        </MenuItem>
        <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
          Logout
        </MenuItem>
      </Menu>

      {/* Mobile Menu */}
      <Menu
        anchorEl={mobileMenuAnchor}
        open={Boolean(mobileMenuAnchor)}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        {user && (
          <>
            <MenuItem disabled>
              <Typography variant="body2" color="text.secondary">
                {user.displayName || user.email}
              </Typography>
            </MenuItem>
            {navLinks.map((link) => (
              <MenuItem
                key={link.path}
                onClick={() => handleNavigation(link.path)}
              >
                {link.label}
              </MenuItem>
            ))}
            <MenuItem onClick={() => handleNavigation(Routes.NOTIFICATIONS)}>
              Notifications
            </MenuItem>
            <MenuItem onClick={() => handleNavigation(Routes.PROFILE)}>
              My Profile
            </MenuItem>
            <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
              Logout
            </MenuItem>
          </>
        )}
      </Menu>
    </>
  );
}
