import { Grid, Box, Button, CircularProgress } from '@mui/material';

interface FormActionsProps {
  isEditMode: boolean;
  submitting: boolean;
  uploadingImages: boolean;
  onCancel: () => void;
}

export default function FormActions({
  isEditMode,
  submitting,
  uploadingImages,
  onCancel,
}: FormActionsProps) {
  return (
    <Grid size={{ xs: 12 }}>
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button variant="outlined" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button
          type="submit"
          variant="contained"
          size="large"
          disabled={submitting || uploadingImages}
        >
          {submitting ? (
            <>
              <CircularProgress size={20} sx={{ mr: 1 }} />
              {isEditMode ? 'Updating...' : 'Creating...'}
            </>
          ) : isEditMode ? (
            'Update Service'
          ) : (
            'Create Service'
          )}
        </Button>
      </Box>
    </Grid>
  );
}
