import { Box, Typography, Button, Container, Paper } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import type { FallbackProps } from 'react-error-boundary';

export function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <Container maxWidth="sm">
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            textAlign: 'center',
            borderRadius: 3,
            maxWidth: 450,
            width: '100%',
          }}
        >
          <ErrorOutlineIcon
            sx={{ fontSize: 64, color: 'error.main', mb: 2 }}
          />
          <Typography variant="h5" fontWeight={600} gutterBottom>
            Something went wrong
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.'}
          </Typography>
          <Button
            variant="contained"
            onClick={resetErrorBoundary}
            sx={{ textTransform: 'none', borderRadius: 2 }}
          >
            Try Again
          </Button>
        </Paper>
      </Box>
    </Container>
  );
}
