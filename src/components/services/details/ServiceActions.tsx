import { Box, Button } from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';

interface ServiceActionsProps {
  isOwner: boolean;
  onEdit: () => void;
  onBookNow: () => void;
  onContactProvider: () => void;
}

export default function ServiceActions({
  isOwner,
  onEdit,
  onBookNow,
  onContactProvider,
}: ServiceActionsProps) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {isOwner ? (
        <Button
          variant="contained"
          size="large"
          startIcon={<EditIcon />}
          onClick={onEdit}
          fullWidth
        >
          Edit Service
        </Button>
      ) : (
        <>
          <Button
            variant="contained"
            size="large"
            onClick={onBookNow}
            fullWidth
          >
            Book Now
          </Button>
          <Button
            variant="outlined"
            size="large"
            onClick={onContactProvider}
            fullWidth
          >
            Contact Provider
          </Button>
        </>
      )}
    </Box>
  );
}
