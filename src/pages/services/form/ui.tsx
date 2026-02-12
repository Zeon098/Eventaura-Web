import {useServiceForm,useImageUpload,useCategoryManager,useServiceSubmit} from './loader';
import {Container,Typography,Box,Grid,Button,CircularProgress,Alert} from '@mui/material';
import ImageUploadSection from '../../../components/services/form/ImageUploadSection';
import CategoriesSection from '../../../components/services/form/CategoriesSection';
import BasicInfoSection from '../../../components/services/form/BasicInfoSection';
import LocationSection from '../../../components/services/form/LocationSection';
import FormActions from '../../../components/services/form/FormActions';
import { ArrowBack as BackIcon } from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { Routes } from '../../../utils/constants';

export default function ServiceFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Data & state from loader hooks
  const form = useServiceForm(id);
  const { uploadingImages, handleImageUpload, handleRemoveImage } = useImageUpload(form.setImages);
  const { handleAddCategory, handleRemoveCategory, handleCategoryChange } = useCategoryManager(
    form.categories,
    form.setCategories,
  );
  const { submitting, handleSubmit } = useServiceSubmit({
    isEditMode: form.isEditMode,
    serviceId: id,
    name: form.name,
    description: form.description,
    city: form.city,
    latitude: form.latitude,
    longitude: form.longitude,
    images: form.images,
    categories: form.categories,
  });

  if (form.loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (form.error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{form.error}</Alert>
        <Button
          startIcon={<BackIcon />}
          onClick={() => navigate(Routes.SERVICES)}
          sx={{ mt: 2 }}
        >
          Back to Services
        </Button>
      </Container>
    );
  }

  return (
    <Box sx={{ py: 4 }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Button
          startIcon={<BackIcon />}
          onClick={() => navigate(-1)}
          sx={{ mb: 3 }}
        >
          Back
        </Button>

        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
          {form.isEditMode ? 'Edit Service' : 'Create New Service'}
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          {form.isEditMode
            ? 'Update your service information'
            : 'Fill in the details to list your service'}
        </Typography>

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <BasicInfoSection
              name={form.name}
              description={form.description}
              onNameChange={form.setName}
              onDescriptionChange={form.setDescription}
            />

            <LocationSection
              address={form.address}
              latitude={form.latitude}
              longitude={form.longitude}
              onAddressChange={(addr, lat, lng) => {
                form.setAddress(addr);
                form.setLatitude(lat);
                form.setLongitude(lng);
                const cityMatch = addr.split(',')[0];
                if (cityMatch) form.setCity(cityMatch.trim());
              }}
            />

            <ImageUploadSection
              images={form.images}
              uploading={uploadingImages}
              onUpload={handleImageUpload}
              onRemove={handleRemoveImage}
            />

            <CategoriesSection
              categories={form.categories}
              onAdd={handleAddCategory}
              onRemove={handleRemoveCategory}
              onChange={handleCategoryChange}
            />

            <FormActions
              isEditMode={form.isEditMode}
              submitting={submitting}
              uploadingImages={uploadingImages}
              onCancel={() => navigate(-1)}
            />
          </Grid>
        </form>
      </Container>
    </Box>
  );
}
