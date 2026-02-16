import { getDocument, updateDocument } from '../../services/firebase/firestore.service';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cloudinaryService } from '../../services/cloudinary/upload.service';
import type { AppUser } from '../../types/user.types';
import { Collections } from '../../utils/constants';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';
import { useState } from 'react';

const profileKey = (id: string) => ['profile', id] as const;


export const useProfile = () => {
  const { user: authUser, updateUser } = useAuth();
  const queryClient = useQueryClient();

  // ---- Fetch ----
  const { data: profile, isLoading, error } = useQuery({
    queryKey: profileKey(authUser?.id ?? ''),
    queryFn: () => getDocument<AppUser>(Collections.USERS, authUser!.id),
    enabled: !!authUser?.id,
    staleTime: 5 * 60 * 1000,
  });

  const user = profile ?? authUser;

  // ---- Draft (null = viewing, object = editing) ----
  const [draft, setDraft] = useState<{ displayName: string; photoUrl: string; city: string } | null>(null);

  const isEditing = draft !== null;
  const displayName = draft?.displayName ?? user?.displayName ?? '';
  const email = user?.email ?? '';
  const photoUrl = draft?.photoUrl ?? user?.photoUrl ?? '';
  const city = draft?.city ?? user?.city ?? '';

  const startEditing = () =>
    setDraft({ displayName: user?.displayName ?? '', photoUrl: user?.photoUrl ?? '', city: user?.city ?? '' });
  const stopEditing = () => setDraft(null);
  const setField = <K extends keyof NonNullable<typeof draft>>(key: K, value: string) =>
    setDraft(prev => (prev ? { ...prev, [key]: value } : prev));

  // ---- Photo upload mutation ----
  const uploadPhoto = useMutation({
    mutationFn: (file: File) => cloudinaryService.uploadImage(file),
    onSuccess: (url) => { setField('photoUrl', url); toast.success('Photo uploaded'); },
    onError: () => toast.error('Failed to upload photo'),
  });

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadPhoto.mutate(file);
  };

  // ---- Save mutation ----
  const saveProfileMutation = useMutation({
    mutationFn: async (updates: { displayName: string; photoUrl: string; city: string }) => {
      const payload = { ...updates, updatedAt: new Date() };
      await updateDocument(Collections.USERS, user!.id, payload);
      await updateUser(payload);
      return payload;
    },
    onSuccess: (payload) => {
      queryClient.setQueryData(profileKey(user!.id), (old: AppUser | null | undefined) =>
        old ? { ...old, ...payload } : old,
      );
      setDraft(null);
      toast.success('Profile updated');
    },
    onError: () => toast.error('Failed to update profile'),
  });

  const handleSave = () => {
    if (!user?.id || !draft) return;
    saveProfileMutation.mutate({ displayName: draft.displayName.trim(), photoUrl: draft.photoUrl, city: draft.city.trim() });
  };

  return {
    user, isLoading, error, isEditing,
    displayName, email, photoUrl, city,
    startEditing, stopEditing, setField, handlePhotoUpload, handleSave,
    uploading: uploadPhoto.isPending,
    saving: saveProfileMutation.isPending,
  };
};
