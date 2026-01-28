import { useState } from 'react';
import { TextField, InputAdornment, IconButton } from '@mui/material';
import { Map as MapIcon } from '@mui/icons-material';
import AddressPickerDialog from './AddressPickerDialog';

interface AddressPickerFieldProps {
  label: string;
  value: string;
  latitude?: number;
  longitude?: number;
  onChange: (address: string, lat: number, lng: number) => void;
  required?: boolean;
  error?: boolean;
  helperText?: string;
}

export default function AddressPickerField({
  label,
  value,
  latitude,
  longitude,
  onChange,
  required = false,
  error = false,
  helperText,
}: AddressPickerFieldProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleSelect = (address: string, lat: number, lng: number) => {
    onChange(address, lat, lng);
    setDialogOpen(false);
  };

  return (
    <>
      <TextField
        fullWidth
        label={label}
        value={value}
        onClick={() => setDialogOpen(true)}
        required={required}
        error={error}
        helperText={helperText}
        InputProps={{
          readOnly: true,
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={() => setDialogOpen(true)} edge="end">
                <MapIcon />
              </IconButton>
            </InputAdornment>
          ),
        }}
        placeholder="Click to select location"
        sx={{ cursor: 'pointer' }}
      />

      <AddressPickerDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSelect={handleSelect}
        initialAddress={value}
        initialLatitude={latitude}
        initialLongitude={longitude}
      />
    </>
  );
}
