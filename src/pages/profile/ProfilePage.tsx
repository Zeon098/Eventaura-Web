import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Avatar,
  Grid,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  PhotoCamera as CameraIcon,
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
import { updateDocument } from '../../services/firebase/firestore.service';
import { cloudinaryService } from '../../services/cloudinary/upload.service';
import { Collections } from '../../utils/constants';
import { getInitials } from '../../utils/formatters';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [photoUrl, setPhotoUrl] = useState(user?.photoUrl || '');
  const [city, setCity] = useState(user?.city || '');

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '');
      setEmail(user.email);
      setPhotoUrl(user.photoUrl || '');
      setCity(user.city || '');
    }
  }, [user]);

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const uploadedUrl = await cloudinaryService.uploadImage(file);
      setPhotoUrl(uploadedUrl);
      toast.success('Photo uploaded successfully');
    } catch (err) {
      console.error('Error uploading photo:', err);
      toast.error('Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!user?.id) return;

    try {
      setSaving(true);

      const updates = {
        displayName: displayName.trim(),
        photoUrl,
        city: city.trim(),
        updatedAt: new Date(),
      };

      await updateDocument(Collections.USERS, user.id, updates);
      await updateUser(updates);

      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (err) {
      console.error('Error updating profile:', err);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset to original values
    if (user) {
      setDisplayName(user.displayName || '');
      setPhotoUrl(user.photoUrl || '');
      setCity(user.city || '');
    }
    setIsEditing(false);
  };

  if (!user) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">User not found</Alert>
      </Container>
    );
  }

  return (
    <Box sx={{ py: 4 }}>
      <Container maxWidth="md">
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
          My Profile
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Manage your account information
        </Typography>

        <Card>
          <CardContent>
            <Grid container spacing={3}>
              {/* Profile Photo */}
              <Grid size={{ xs: 12 }} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
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
                        onChange={handlePhotoUpload}
                      />
                    </Button>
                  )}
                </Box>
                {user.isProvider && (
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
              </Grid>

              {/* Form Fields */}
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Display Name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  disabled={!isEditing}
                  sx={{ mb: 2 }}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Email"
                  value={email}
                  disabled
                  helperText="Email cannot be changed"
                  sx={{ mb: 2 }}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="City"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  disabled={!isEditing}
                  placeholder="e.g., Lahore"
                />
              </Grid>

              {/* Action Buttons */}
              <Grid size={{ xs: 12 }}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  {isEditing ? (
                    <>
                      <Button
                        variant="outlined"
                        startIcon={<CancelIcon />}
                        onClick={handleCancel}
                        disabled={saving}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="contained"
                        startIcon={<SaveIcon />}
                        onClick={handleSave}
                        disabled={saving || uploading}
                      >
                        {saving ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="contained"
                      startIcon={<EditIcon />}
                      onClick={() => setIsEditing(true)}
                    >
                      Edit Profile
                    </Button>
                  )}
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
