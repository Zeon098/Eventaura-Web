import { Box, Button } from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';

interface ProfileActionsProps {
  isEditing: boolean;
  saving: boolean;
  uploading: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
}

export default function ProfileActions({
  isEditing,
  saving,
  uploading,
  onEdit,
  onSave,
  onCancel,
}: ProfileActionsProps) {
  return (
    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
      {isEditing ? (
        <>
          <Button
            variant="outlined"
            startIcon={<CancelIcon />}
            onClick={onCancel}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={onSave}
            disabled={saving || uploading}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </>
      ) : (
        <Button
          variant="contained"
          startIcon={<EditIcon />}
          onClick={onEdit}
        >
          Edit Profile
        </Button>
      )}
    </Box>
  );
}
