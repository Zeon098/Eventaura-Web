import { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Alert,
} from '@mui/material';
import { useProfileForm, usePhotoUpload, useSaveProfile } from './loader';
import ProfileAvatar from '../../../components/profile/ProfileAvatar';
import ProfileFormFields from '../../../components/profile/ProfileFormFields';
import ProfileActions from '../../../components/profile/ProfileActions';

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);

  // Data & actions from loader.ts
  const {
    user, updateUser,
    displayName, setDisplayName,
    email,
    photoUrl, setPhotoUrl,
    city, setCity,
    resetForm,
  } = useProfileForm();
  const { uploading, handlePhotoUpload } = usePhotoUpload(setPhotoUrl);
  const { saving, saveProfile } = useSaveProfile();

  const handleSave = async () => {
    if (!user?.id) return;
    const success = await saveProfile(
      user.id,
      { displayName: displayName.trim(), photoUrl, city: city.trim() },
      updateUser,
    );
    if (success) setIsEditing(false);
  };

  const handleCancel = () => {
    resetForm();
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
                <ProfileAvatar
                  photoUrl={photoUrl}
                  displayName={displayName}
                  email={email}
                  isEditing={isEditing}
                  uploading={uploading}
                  isProvider={user.isProvider ?? false}
                  onPhotoUpload={handlePhotoUpload}
                />
              </Grid>

              {/* Form Fields */}
              <ProfileFormFields
                displayName={displayName}
                email={email}
                city={city}
                isEditing={isEditing}
                onDisplayNameChange={setDisplayName}
                onCityChange={setCity}
              />

              {/* Action Buttons */}
              <Grid size={{ xs: 12 }}>
                <ProfileActions
                  isEditing={isEditing}
                  saving={saving}
                  uploading={uploading}
                  onEdit={() => setIsEditing(true)}
                  onSave={handleSave}
                  onCancel={handleCancel}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
