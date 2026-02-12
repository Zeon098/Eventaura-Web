import { Box, Avatar, Button, CircularProgress, Typography } from '@mui/material';
import { PhotoCamera as CameraIcon } from '@mui/icons-material';
import { getInitials } from '../../utils/formatters';

interface ProfileAvatarProps {
  photoUrl: string;
  displayName: string;
  email: string;
  isEditing: boolean;
  uploading: boolean;
  isProvider: boolean;
  onPhotoUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function ProfileAvatar({
  photoUrl,
  displayName,
  email,
  isEditing,
  uploading,
  isProvider,
  onPhotoUpload,
}: ProfileAvatarProps) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Box sx={{ position: 'relative', mb: 2 }}>
        <Avatar
          src={photoUrl || undefined}
          alt={displayName || email}
          sx={{ width: 120, height: 120, fontSize: 48 }}
        >
          {!photoUrl && getInitials(displayName || email)}
        </Avatar>
        {isEditing && (
          <Button
            component="label"
            variant="contained"
            size="small"
            sx={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              borderRadius: '50%',
              minWidth: 40,
              width: 40,
              height: 40,
              p: 0,
            }}
            disabled={uploading}
          >
            {uploading ? (
              <CircularProgress size={20} />
            ) : (
              <CameraIcon fontSize="small" />
            )}
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={onPhotoUpload}
            />
          </Button>
        )}
      </Box>
      {isProvider && (
        <Box
          sx={{
            px: 2,
            py: 0.5,
            borderRadius: 1,
            bgcolor: 'primary.main',
            color: 'white',
          }}
        >
          <Typography variant="caption" fontWeight="bold">
            PROVIDER
          </Typography>
        </Box>
      )}
    </Box>
  );
}
