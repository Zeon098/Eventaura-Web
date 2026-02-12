import { Grid, Card, CardContent, Typography } from '@mui/material';
import AddressPickerField from '../../location/AddressPickerField';

interface LocationSectionProps {
  address: string;
  latitude: number | undefined;
  longitude: number | undefined;
  onAddressChange: (addr: string, lat?: number, lng?: number) => void;
}

export default function LocationSection({
  address,
  latitude,
  longitude,
  onAddressChange,
}: LocationSectionProps) {
  return (
    <Grid size={{ xs: 12 }}>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Location
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <AddressPickerField
                label="Service Location"
                value={address}
                latitude={latitude}
                longitude={longitude}
                onChange={(addr, lat, lng) => onAddressChange(addr, lat, lng)}
                required
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Grid>
  );
}
