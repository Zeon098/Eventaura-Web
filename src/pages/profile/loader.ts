import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { updateDocument } from '../../services/firebase/firestore.service';
import { cloudinaryService } from '../../services/cloudinary/upload.service';
import { Collections } from '../../utils/constants';
import toast from 'react-hot-toast';

/**
 * Custom hook for profile form state
 * Syncs form fields with the authenticated user and provides reset functionality
 */
export const useProfileForm = () => {
  const { user, updateUser } = useAuth();

  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [photoUrl, setPhotoUrl] = useState(user?.photoUrl || '');
  const [city, setCity] = useState(user?.city || '');

  useEffect(() => {
    if (user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDisplayName(user.displayName || '');
      setEmail(user.email);
      setPhotoUrl(user.photoUrl || '');
      setCity(user.city || '');
    }
  }, [user]);

  const resetForm = useCallback(() => {
    if (user) {
      setDisplayName(user.displayName || '');
      setPhotoUrl(user.photoUrl || '');
      setCity(user.city || '');
    }
  }, [user]);

  return {
    user,
    updateUser,
    displayName, setDisplayName,
    email,
    photoUrl, setPhotoUrl,
    city, setCity,
    resetForm,
  };
};

/**
 * Custom hook for uploading a profile photo via Cloudinary
 */
export const usePhotoUpload = (setPhotoUrl: (url: string) => void) => {
  const [uploading, setUploading] = useState(false);

  const handlePhotoUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const uploadedUrl = await cloudinaryService.uploadImage(file);
      setPhotoUrl(uploadedUrl);
      toast.success('Photo uploaded successfully');
    } catch (err) {
      console.error('Error uploading photo:', err);
      toast.error('Failed to upload photo');
    } finally {
      setUploading(false);
    }
  }, [setPhotoUrl]);

  return { uploading, handlePhotoUpload };
};

/**
 * Custom hook for saving profile updates to Firestore
 */
export const useSaveProfile = () => {
  const [saving, setSaving] = useState(false);

  const saveProfile = useCallback(async (
    userId: string,
    updates: { displayName: string; photoUrl: string; city: string },
    updateUser: (updates: Record<string, unknown>) => Promise<void>,
  ) => {
    setSaving(true);
    try {
      const payload = {
        ...updates,
        updatedAt: new Date(),
      };
      await updateDocument(Collections.USERS, userId, payload);
      await updateUser(payload);
      toast.success('Profile updated successfully');
      return true;
    } catch (err) {
      console.error('Error updating profile:', err);
      toast.error('Failed to update profile');
      return false;
    } finally {
      setSaving(false);
    }
  }, []);

  return { saving, saveProfile };
};
