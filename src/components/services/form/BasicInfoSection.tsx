import { Grid, Card, CardContent, Typography, TextField } from '@mui/material';

interface BasicInfoSectionProps {
  name: string;
  description: string;
  onNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
}

export default function BasicInfoSection({
  name,
  description,
  onNameChange,
  onDescriptionChange,
}: BasicInfoSectionProps) {
  return (
    <Grid size={{ xs: 12 }}>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Basic Information
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Service Name"
                value={name}
                onChange={(e) => onNameChange(e.target.value)}
                required
                placeholder="e.g., Professional Photography Services"
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Description"
                value={description}
                onChange={(e) => onDescriptionChange(e.target.value)}
                required
                multiline
                rows={4}
                placeholder="Describe your service in detail..."
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Grid>
  );
}
