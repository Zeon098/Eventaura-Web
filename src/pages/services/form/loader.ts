import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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

/* ── Form hook ──────────────────────────────────────── */

export function useServiceForm(serviceId: string | undefined) {
  const { user } = useAuth();
  const isEditMode = Boolean(serviceId);

  // Form fields (local state — these are UI draft, not server state)
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
  const [hydrated, setHydrated] = useState(!isEditMode);

  // Fetch existing service in edit mode and hydrate form once
  const { isLoading, error } = useQuery({
    queryKey: ['service', serviceId],
    queryFn: async () => {
      const data = await getDocument<ServiceModel>(Collections.SERVICES, serviceId!);
      if (!data) throw new Error('Service not found');
      if (data.providerId !== user?.id) throw new Error('You do not have permission to edit this service');
      return data;
    },
    enabled: isEditMode && !!serviceId && !hydrated,
    staleTime: 5 * 60_000,
    select(data) {
      // Hydrate form fields once after fetch
      if (!hydrated) {
        setName(data.title);
        setDescription(data.description);
        setCity(data.location || '');
        setAddress(data.location || '');
        setLatitude(data.latitude);
        setLongitude(data.longitude);
        setImages(data.galleryImages || []);
        setCategories(
          data.categories.map((cat) => ({
            name: cat.name,
            price: cat.price,
            pricingType: cat.pricingType || 'base',
          })),
        );
        setHydrated(true);
      }
      return data;
    },
  });

  return {
    isEditMode,
    loading: isEditMode && !hydrated && isLoading,
    error: error?.message ?? null,
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

/* ── Image upload hook ──────────────────────────────── */

export function useImageUpload(
  setImages: React.Dispatch<React.SetStateAction<string[]>>,
) {
  const uploadMutation = useMutation({
    mutationFn: (files: File[]) => cloudinaryService.uploadImages(files),
    onSuccess: (urls) => {
      setImages((prev) => [...prev, ...urls]);
      toast.success(`${urls.length} image(s) uploaded successfully`);
    },
    onError: () => toast.error('Failed to upload images'),
  });

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    uploadMutation.mutate(Array.from(files));
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  return { uploadingImages: uploadMutation.isPending, handleImageUpload, handleRemoveImage };
}

/* ── Category manager hook (pure local state — no conversion needed) ── */

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

/* ── Submit hook ────────────────────────────────────── */

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
  const queryClient = useQueryClient();

  const submitMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('You must be logged in');

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

      let id: string;
      if (formState.isEditMode && formState.serviceId) {
        await updateDocument(Collections.SERVICES, formState.serviceId, serviceData);
        id = formState.serviceId;
      } else {
        id = await addDocument(Collections.SERVICES, serviceData);
      }

      // Index in Algolia (best-effort)
      try { await algoliaService.indexService({ ...serviceData, id } as ServiceModel); } catch { /* skip */ }

      return id;
    },
    onSuccess: (id) => {
      toast.success(formState.isEditMode ? 'Service updated successfully' : 'Service created successfully');
      queryClient.invalidateQueries({ queryKey: ['service', id] });
      queryClient.invalidateQueries({ queryKey: ['services'] });
      navigate(`${Routes.SERVICES}/${id}`);
    },
    onError: () => toast.error('Failed to save service'),
  });

  const validateForm = (): boolean => {
    if (!formState.name.trim()) { toast.error('Service name is required'); return false; }
    if (!formState.description.trim()) { toast.error('Description is required'); return false; }
    if (!formState.city.trim()) { toast.error('City is required'); return false; }
    if (formState.categories.some((c) => !c.name.trim())) { toast.error('All categories must have a name'); return false; }
    if (formState.categories.some((c) => c.price <= 0)) { toast.error('All categories must have a valid price'); return false; }
    return true;
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!validateForm()) return;
    submitMutation.mutate();
  };

  return { submitting: submitMutation.isPending, handleSubmit };
}
