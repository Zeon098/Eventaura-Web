import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { getDocument, updateDocument, addDocument } from '../../../services/firebase/firestore.service';
import { cloudinaryService } from '../../../services/cloudinary/upload.service';
import { algoliaService } from '../../../services/algolia/search.service';
import type { ServiceModel } from '../../../types/service.types';
import { Collections, Routes } from '../../../utils/constants';
import toast from 'react-hot-toast';

export interface CategoryFormData {
  name: string;
  price: number;
  pricingType: 'base' | 'per_head' | 'per_100_persons';
}

/**
 * Hook that manages all form field state and loads existing data in edit mode.
 */
export function useServiceForm(serviceId: string | undefined) {
  const { user } = useAuth();
  const isEditMode = Boolean(serviceId);

  const [loading, setLoading] = useState(isEditMode);
  const [error, setError] = useState<string | null>(null);

  // Form fields
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
    if (!isEditMode || !serviceId) return;

    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        const serviceData = await getDocument<ServiceModel>(Collections.SERVICES, serviceId);

        if (cancelled) return;

        if (!serviceData) {
          setError('Service not found');
          return;
        }

        if (serviceData.providerId !== user?.id) {
          setError('You do not have permission to edit this service');
          return;
        }

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
          })),
        );
      } catch (err) {
        if (!cancelled) {
          console.error('Error loading service:', err);
          setError('Failed to load service');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serviceId, isEditMode]);

  return {
    isEditMode,
    loading,
    error,
    name, setName,
    description, setDescription,
    city, setCity,
    address, setAddress,
    latitude, setLatitude,
    longitude, setLongitude,
    images, setImages,
    categories, setCategories,
  };
}

/**
 * Hook for uploading images to Cloudinary.
 */
export function useImageUpload(
  setImages: React.Dispatch<React.SetStateAction<string[]>>,
) {
  const [uploadingImages, setUploadingImages] = useState(false);

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

  return { uploadingImages, handleImageUpload, handleRemoveImage };
}

/**
 * Hook for managing the categories list.
 */
export function useCategoryManager(
  categories: CategoryFormData[],
  setCategories: React.Dispatch<React.SetStateAction<CategoryFormData[]>>,
) {
  const handleAddCategory = () => {
    setCategories((prev) => [...prev, { name: '', price: 0, pricingType: 'base' }]);
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
    value: string | number,
  ) => {
    setCategories((prev) =>
      prev.map((cat, i) => (i === index ? { ...cat, [field]: value } : cat)),
    );
  };

  return { handleAddCategory, handleRemoveCategory, handleCategoryChange };
}

/**
 * Hook for form validation and submission.
 */
export function useServiceSubmit(formState: {
  isEditMode: boolean;
  serviceId: string | undefined;
  name: string;
  description: string;
  city: string;
  latitude: number | undefined;
  longitude: number | undefined;
  images: string[];
  categories: CategoryFormData[];
}) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  const validateForm = (): boolean => {
    if (!formState.name.trim()) {
      toast.error('Service name is required');
      return false;
    }
    if (!formState.description.trim()) {
      toast.error('Description is required');
      return false;
    }
    if (!formState.city.trim()) {
      toast.error('City is required');
      return false;
    }
    if (formState.categories.some((cat) => !cat.name.trim())) {
      toast.error('All categories must have a name');
      return false;
    }
    if (formState.categories.some((cat) => cat.price <= 0)) {
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
        title: formState.name.trim(),
        description: formState.description.trim(),
        location: formState.city.trim(),
        latitude: formState.latitude,
        longitude: formState.longitude,
        coverImage: formState.images[0] || '',
        galleryImages: formState.images,
        categories: formState.categories.map((cat, index) => ({
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

      if (formState.isEditMode && formState.serviceId) {
        await updateDocument(Collections.SERVICES, formState.serviceId, serviceData);
        serviceId = formState.serviceId;
        toast.success('Service updated successfully');
      } else {
        serviceId = await addDocument(Collections.SERVICES, serviceData);
        toast.success('Service created successfully');
      }

      try {
        await algoliaService.indexService({ ...serviceData, id: serviceId } as ServiceModel);
      } catch (algoliaErr) {
        console.error('Failed to index in Algolia:', algoliaErr);
      }

      navigate(`${Routes.SERVICES}/${serviceId}`);
    } catch (err) {
      console.error('Error saving service:', err);
      toast.error('Failed to save service');
    } finally {
      setSubmitting(false);
    }
  };

  return { submitting, handleSubmit };
}
