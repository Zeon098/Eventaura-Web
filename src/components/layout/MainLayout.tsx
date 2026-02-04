import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';
import TopNavbar from './TopNavbar';
// import Footer from './Footer';

export default function MainLayout() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
      }}
    >
      <TopNavbar />
      <Box
        component="main"
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Outlet />
      </Box>
      {/* <Footer /> */}
    </Box>
  );
}
