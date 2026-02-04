import { useState, useEffect } from 'react';
import {
  Container,Typography,Box,Grid,TextField,Button,Card,CardContent,IconButton,MenuItem,FormControl,InputLabel,Select,CircularProgress,Alert,ImageList,ImageListItem,ImageListItemBar,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  CloudUpload as UploadIcon,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getDocument, updateDocument, addDocument } from '../../services/firebase/firestore.service';
import { cloudinaryService } from '../../services/cloudinary/upload.service';
import { algoliaService } from '../../services/algolia/search.service';
import { type ServiceModel } from '../../types/service.types';
import { Collections, Routes } from '../../utils/constants';
import AddressPickerField from '../../components/location/AddressPickerField';
import toast from 'react-hot-toast';

interface CategoryFormData {
  name: string;
  price: number;
  pricingType: 'base' | 'per_head' | 'per_100_persons';
}

export default function ServiceFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEditMode = Boolean(id);

  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState<number | undefined>();
  const [longitude, setLongitude] = useState<number | undefined>();
  const [images, setImages] = useState<string[]>([]);
  const [categories, setCategories] = useState<CategoryFormData[]>([
    { name: '', price: 0, pricingType: 'base' },
  ]);

  useEffect(() => {
    if (isEditMode && id) {
      loadService(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isEditMode]);

  const loadService = async (serviceId: string) => {
    try {
      setLoading(true);
      const serviceData = await getDocument<ServiceModel>(Collections.SERVICES, serviceId);
      
      if (!serviceData) {
        setError('Service not found');
        return;
      }

      // Check if user is the owner
      if (serviceData.providerId !== user?.id) {
        setError('You do not have permission to edit this service');
        return;
      }

      // Populate form
      setName(serviceData.title);
      setDescription(serviceData.description);
      setCity(serviceData.location || '');
      setAddress(serviceData.location || '');
      setLatitude(serviceData.latitude);
      setLongitude(serviceData.longitude);
      setImages(serviceData.galleryImages || []);
      setCategories(
        serviceData.categories.map((cat) => ({
          name: cat.name,
          price: cat.price,
          pricingType: cat.pricingType || 'base',
        }))
      );
    } catch (err) {
      console.error('Error loading service:', err);
      setError('Failed to load service');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    try {
      setUploadingImages(true);
      
      const fileArray = Array.from(files);
      const uploadedUrls = await cloudinaryService.uploadImages(fileArray);
      
      setImages((prev) => [...prev, ...uploadedUrls]);
      toast.success(`${uploadedUrls.length} image(s) uploaded successfully`);
    } catch (err) {
      console.error('Error uploading images:', err);
      toast.error('Failed to upload images');
    } finally {
      setUploadingImages(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddCategory = () => {
    setCategories((prev) => [
      ...prev,
      { name: '', price: 0, pricingType: 'base' },
    ]);
  };

  const handleRemoveCategory = (index: number) => {
    if (categories.length === 1) {
      toast.error('At least one category is required');
      return;
    }
    setCategories((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCategoryChange = (
    index: number,
    field: keyof CategoryFormData,
    value: string | number
  ) => {
    setCategories((prev) =>
      prev.map((cat, i) =>
        i === index ? { ...cat, [field]: value } : cat
      )
    );
  };

  const validateForm = (): boolean => {
    if (!name.trim()) {
      toast.error('Service name is required');
      return false;
    }
    if (!description.trim()) {
      toast.error('Description is required');
      return false;
    }
    if (!city.trim()) {
      toast.error('City is required');
      return false;
    }
    if (categories.some((cat) => !cat.name.trim())) {
      toast.error('All categories must have a name');
      return false;
    }
    if (categories.some((cat) => cat.price <= 0)) {
      toast.error('All categories must have a valid price');
      return false;
    }
    return true;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!validateForm()) return;
    if (!user?.id) {
      toast.error('You must be logged in to create a service');
      return;
    }

    try {
      setSubmitting(true);

      const serviceData: Omit<ServiceModel, 'id'> = {
        title: name.trim(),
        description: description.trim(),
        location: city.trim(),
        latitude,
        longitude,
        coverImage: images[0] || '',
        galleryImages: images,
        categories: categories.map((cat, index) => ({
          id: `${cat.name.toLowerCase().replace(/\s+/g, '-')}-${index}`,
          name: cat.name.trim(),
          price: cat.price,
          pricingType: cat.pricingType,
        })),
        providerId: user.id,
        rating: 0,
        venueSubtypes: [],
      };

      let serviceId: string;

      if (isEditMode && id) {
        // Update existing service
        await updateDocument(Collections.SERVICES, id, serviceData);
        serviceId = id;
        toast.success('Service updated successfully');
      } else {
        // Create new service
        serviceId = await addDocument(Collections.SERVICES, serviceData);
        toast.success('Service created successfully');
      }

      // Index in Algolia
      try {
        await algoliaService.indexService({
          ...serviceData,
          id: serviceId,
        } as ServiceModel);
      } catch (algoliaErr) {
        console.error('Failed to index in Algolia:', algoliaErr);
        // Don't fail the whole operation if Algolia indexing fails
      }

      // Navigate to service detail page
      navigate(`${Routes.SERVICES}/${serviceId}`);
    } catch (err) {
      console.error('Error saving service:', err);
      toast.error('Failed to save service');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
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
          {isEditMode ? 'Edit Service' : 'Create New Service'}
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          {isEditMode
            ? 'Update your service information'
            : 'Fill in the details to list your service'}
        </Typography>

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Basic Information */}
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
                        onChange={(e) => setName(e.target.value)}
                        required
                        placeholder="e.g., Professional Photography Services"
                      />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <TextField
                        fullWidth
                        label="Description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
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

            {/* Location */}
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
                        onChange={(addr, lat, lng) => {
                          setAddress(addr);
                          setLatitude(lat);
                          setLongitude(lng);
                          // Extract city from address (first part before comma)
                          const cityMatch = addr.split(',')[0];
                          if (cityMatch) {
                            setCity(cityMatch.trim());
                          }
                        }}
                        required
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Images */}
            <Grid size={{ xs: 12 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Images
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Button
                      variant="outlined"
                      component="label"
                      startIcon={<UploadIcon />}
                      disabled={uploadingImages}
                    >
                      {uploadingImages ? 'Uploading...' : 'Upload Images'}
                      <input
                        type="file"
                        hidden
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                      />
                    </Button>
                  </Box>
                  {images.length > 0 && (
                    <ImageList cols={4} gap={8}>
                      {images.map((image, index) => (
                        <ImageListItem key={index}>
                          <img
                            src={image}
                            alt={`Service image ${index + 1}`}
                            style={{
                              width: '100%',
                              height: 150,
                              objectFit: 'cover',
                              borderRadius: 4,
                            }}
                          />
                          <ImageListItemBar
                            actionIcon={
                              <IconButton
                                sx={{ color: 'white' }}
                                onClick={() => handleRemoveImage(index)}
                              >
                                <DeleteIcon />
                              </IconButton>
                            }
                          />
                        </ImageListItem>
                      ))}
                    </ImageList>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Categories & Pricing */}
            <Grid size={{ xs: 12 }}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6">Categories & Pricing</Typography>
                    <Button
                      startIcon={<AddIcon />}
                      onClick={handleAddCategory}
                      size="small"
                    >
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
                              onChange={(e) =>
                                handleCategoryChange(index, 'name', e.target.value)
                              }
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
                              onChange={(e) =>
                                handleCategoryChange(index, 'price', Number(e.target.value))
                              }
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
                                  handleCategoryChange(
                                    index,
                                    'pricingType',
                                    e.target.value as CategoryFormData['pricingType']
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
                              onClick={() => handleRemoveCategory(index)}
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

            {/* Submit Buttons */}
            <Grid size={{ xs: 12 }}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate(-1)}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={submitting || uploadingImages}
                >
                  {submitting ? (
                    <>
                      <CircularProgress size={20} sx={{ mr: 1 }} />
                      {isEditMode ? 'Updating...' : 'Creating...'}
                    </>
                  ) : isEditMode ? (
                    'Update Service'
                  ) : (
                    'Create Service'
                  )}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Container>
    </Box>
  );
}
