import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { getDocument } from '../../../services/firebase/firestore.service';
import { getOrCreateChatRoom } from '../../../services/firebase/chat.service';
import type { ServiceModel } from '../../../types/service.types';
import type { AppUser } from '../../../types/user.types';
import { Collections, Routes } from '../../../utils/constants';
import toast from 'react-hot-toast';

/**
 * Hook to load a service and its provider by ID.
 */
export function useServiceDetail(serviceId: string | undefined) {
  const [service, setService] = useState<ServiceModel | null>(null);
  const [provider, setProvider] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!serviceId) return;

    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const serviceData = await getDocument<ServiceModel>(Collections.SERVICES, serviceId);

        if (cancelled) return;

        if (!serviceData) {
          setError('Service not found');
          return;
        }

        setService(serviceData);

        if (serviceData.providerId) {
          const providerData = await getDocument<AppUser>(Collections.USERS, serviceData.providerId);
          if (!cancelled && providerData) {
            setProvider(providerData);
          }
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Error loading service:', err);
          setError('Failed to load service details');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [serviceId]);

  return { service, provider, loading, error };
}

/**
 * Hook that provides service-detail page actions (book, contact, edit).
 */
export function useServiceActions(
  service: ServiceModel | null,
  provider: AppUser | null,
) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);

  const isOwner = user?.id === service?.providerId;

  const handleBookNow = () => {
    setBookingDialogOpen(true);
  };

  const handleCloseBooking = () => {
    setBookingDialogOpen(false);
  };

  const handleContactProvider = async () => {
    if (!service?.providerId || !user?.id || !provider) return;

    try {
      const roomId = await getOrCreateChatRoom(
        user.id,
        service.providerId,
      );
      navigate(`${Routes.CHAT}/${roomId}`);
    } catch (err) {
      console.error('Error creating chat room:', err);
      toast.error('Failed to start conversation');
    }
  };

  const handleEdit = () => {
    if (!service?.id) return;
    navigate(`${Routes.SERVICE_EDIT.replace(':id', service.id)}`);
  };

  return {
    isOwner,
    bookingDialogOpen,
    handleBookNow,
    handleCloseBooking,
    handleContactProvider,
    handleEdit,
  };
}
