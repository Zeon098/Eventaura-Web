import { Grid, TextField } from '@mui/material';
import AddressPickerField from '../location/AddressPickerField';

interface ProfileFormFieldsProps {
  displayName: string;
  email: string;
  city: string;
  isEditing: boolean;
  onDisplayNameChange: (value: string) => void;
  onCityChange: (value: string) => void;
}

export default function ProfileFormFields({
  displayName,
  email,
  city,
  isEditing,
  onDisplayNameChange,
  onCityChange,
}: ProfileFormFieldsProps) {
  return (
    <>
      <Grid size={{ xs: 12 }}>
        <TextField
          fullWidth
          label="Display Name"
          value={displayName}
          onChange={(e) => onDisplayNameChange(e.target.value)}
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
        <AddressPickerField
          label="City"
          value={city}
          onChange={(address) => onCityChange(address)}
          disabled={!isEditing}
          helperText="Select your city"
        />
      </Grid>
    </>
  );
}
