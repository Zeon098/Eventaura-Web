import { Box, Skeleton } from '@mui/material';

export default function ChatSkeletonLoader() {
  return (
    <Box sx={{ flex: 1, p: 2, bgcolor: 'background.default' }}>
      {[...Array(8)].map((_, index) => (
        <Box
          key={index}
          sx={{
            display: 'flex',
            justifyContent: index % 2 === 0 ? 'flex-start' : 'flex-end',
            mb: 2,
          }}
        >
          <Box sx={{ maxWidth: '70%' }}>
            <Skeleton
              variant="rectangular"
              width={ 200 + 150}
              height={60}
              sx={{ borderRadius: 2 }}
            />
          </Box>
        </Box>
      ))}
    </Box>
  );
}
