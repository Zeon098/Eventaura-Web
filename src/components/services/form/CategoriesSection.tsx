import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  TextField,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import type { CategoryFormData } from '../../../pages/services/form/loader';

interface CategoriesSectionProps {
  categories: CategoryFormData[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  onChange: (index: number, field: keyof CategoryFormData, value: string | number) => void;
}

export default function CategoriesSection({
  categories,
  onAdd,
  onRemove,
  onChange,
}: CategoriesSectionProps) {
  return (
    <Grid size={{ xs: 12 }}>
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">Categories & Pricing</Typography>
            <Button startIcon={<AddIcon />} onClick={onAdd} size="small">
              Add Category
            </Button>
          </Box>
          {categories.map((category, index) => (
            <Card key={index} variant="outlined" sx={{ mb: 2 }}>
              <CardContent>
                <Grid container spacing={2} alignItems="center">
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField
                      fullWidth
                      label="Category Name"
                      value={category.name}
                      onChange={(e) => onChange(index, 'name', e.target.value)}
                      required
                      placeholder="e.g., Basic Package"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 3 }}>
                    <TextField
                      fullWidth
                      label="Price"
                      type="number"
                      value={category.price}
                      onChange={(e) => onChange(index, 'price', Number(e.target.value))}
                      required
                      InputProps={{
                        startAdornment: <Typography sx={{ mr: 1 }}>PKR</Typography>,
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <FormControl fullWidth>
                      <InputLabel>Pricing Type</InputLabel>
                      <Select
                        value={category.pricingType}
                        onChange={(e) =>
                          onChange(
                            index,
                            'pricingType',
                            e.target.value as CategoryFormData['pricingType'],
                          )
                        }
                        label="Pricing Type"
                      >
                        <MenuItem value="base">Base Price</MenuItem>
                        <MenuItem value="per_head">Per Person</MenuItem>
                        <MenuItem value="per_100_persons">Per 100 Persons</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid size={{ xs: 12, md: 1 }}>
                    <IconButton
                      color="error"
                      onClick={() => onRemove(index)}
                      disabled={categories.length === 1}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>
    </Grid>
  );
}
