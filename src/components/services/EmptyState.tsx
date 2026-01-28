import { Box, Typography } from '@mui/material';

interface EmptyStateProps {
  searchQuery: string;
}

export default function EmptyState({ searchQuery }: EmptyStateProps) {
  return (
    <Box sx={{ textAlign: 'center', py: 8 }}>
      <Typography variant="h5" color="text.secondary" gutterBottom>
        No services found
      </Typography>
      <Typography variant="body1" color="text.secondary">
        {searchQuery
          ? 'Try adjusting your search terms'
          : 'Be the first to add a service!'}
      </Typography>
    </Box>
  );
}
