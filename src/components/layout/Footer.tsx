import { Box, Container, Typography, Link as MuiLink, Grid } from '@mui/material';
import { Link } from 'react-router-dom';
import { Routes } from '../../utils/constants';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    Company: [
      { label: 'About Us', path: '/about' },
      { label: 'Contact', path: '/contact' },
      { label: 'Careers', path: '/careers' },
    ],
    Services: [
      { label: 'Browse Services', path: Routes.SERVICES },
      { label: 'Become a Provider', path: Routes.BECOME_PROVIDER },
    ],
    Support: [
      { label: 'Help Center', path: '/help' },
      { label: 'Terms of Service', path: '/terms' },
      { label: 'Privacy Policy', path: '/privacy' },
    ],
  };

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: 'background.paper',
        borderTop: '1px solid',
        borderColor: 'divider',
        py: 6,
        mt: 'auto',
      }}
    >
      <Container maxWidth="xl">
        <Grid container spacing={4}>
          {/* Brand Section */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                color: 'primary.main',
                mb: 2,
              }}
            >
              Eventaura
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Your one-stop platform for booking event services. Connect with
              trusted providers for all your event needs.
            </Typography>
          </Grid>

          {/* Links Sections */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <Grid size={{ xs: 6, sm: 4, md: 2 }} key={title}>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 600, mb: 2 }}
              >
                {title}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {links.map((link) => (
                  <MuiLink
                    key={link.path}
                    component={Link}
                    to={link.path}
                    color="text.secondary"
                    underline="hover"
                    sx={{
                      fontSize: '0.875rem',
                      '&:hover': {
                        color: 'primary.main',
                      },
                    }}
                  >
                    {link.label}
                  </MuiLink>
                ))}
              </Box>
            </Grid>
          ))}
        </Grid>

        {/* Copyright */}
        <Box
          sx={{
            mt: 4,
            pt: 3,
            borderTop: '1px solid',
            borderColor: 'divider',
            textAlign: 'center',
          }}
        >
          <Typography variant="body2" color="text.secondary">
            © {currentYear} Eventaura. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
