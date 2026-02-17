import {Container,Typography,Box,Card,CardContent,Grid,Alert,CircularProgress,} from '@mui/material';
import ProfileFormFields from '../../components/profile/ProfileFormFields';
import ProfileActions from '../../components/profile/ProfileActions';
import ProfileAvatar from '../../components/profile/ProfileAvatar';
import { useProfile } from './loader';

export default function ProfilePage() {
  const {
    user, isLoading, error, isEditing,
    displayName, email, photoUrl, city,
    startEditing, stopEditing, setField, handlePhotoUpload, handleSave,
    uploading, saving,
  } = useProfile();

  if (isLoading) {
    return (
      <Container maxWidth="md" sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">Failed to load profile: {error.message}</Alert>
      </Container>
    );
  }

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
                onDisplayNameChange={(v) => setField('displayName', v)}
                onCityChange={(v) => setField('city', v)}
              />

              {/* Action Buttons */}
              <Grid size={{ xs: 12 }}>
                <ProfileActions
                  isEditing={isEditing}
                  saving={saving}
                  uploading={uploading}
                  onEdit={startEditing}
                  onSave={handleSave}
                  onCancel={stopEditing}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
