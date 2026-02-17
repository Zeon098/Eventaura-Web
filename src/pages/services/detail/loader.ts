import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '../../../hooks/useAuth';
import { getDocument } from '../../../services/firebase/firestore.service';
import { getOrCreateChatRoom } from '../../../services/firebase/chat.service';
import type { ServiceModel } from '../../../types/service.types';
import type { AppUser } from '../../../types/user.types';
import { Collections, Routes } from '../../../utils/constants';
import toast from 'react-hot-toast';

/* ── Fetcher ────────────────────────────────────────── */

async function fetchServiceWithProvider(serviceId: string) {
  const service = await getDocument<ServiceModel>(Collections.SERVICES, serviceId);
  if (!service) throw new Error('Service not found');

  let provider: AppUser | null = null;
  if (service.providerId) {
    provider = await getDocument<AppUser>(Collections.USERS, service.providerId);
  }
  return { service, provider };
}

/* ── Main hook ──────────────────────────────────────── */

export function useServiceDetail(serviceId: string | undefined) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['service', serviceId],
    queryFn: () => fetchServiceWithProvider(serviceId!),
    enabled: !!serviceId,
    staleTime: 5 * 60_000,
  });

  return {
    service: data?.service ?? null,
    provider: data?.provider ?? null,
    loading: isLoading,
    error: error?.message ?? null,
  };
}

/* ── Actions hook ───────────────────────────────────── */

export function useServiceActions(
  service: ServiceModel | null,
  provider: AppUser | null,
) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);

  const isOwner = user?.id === service?.providerId;

  const contactMutation = useMutation({
    mutationFn: () => getOrCreateChatRoom(user!.id, service!.providerId),
    onSuccess: (roomId) => navigate(`${Routes.CHAT}/${roomId}`),
    onError: () => toast.error('Failed to start conversation'),
  });

  const handleContactProvider = () => {
    if (!service?.providerId || !user?.id || !provider) return;
    contactMutation.mutate();
  };

  const handleEdit = () => {
    if (!service?.id) return;
    navigate(`${Routes.SERVICE_EDIT.replace(':id', service.id)}`);
  };

  return {
    isOwner,
    bookingDialogOpen,
    handleBookNow: () => setBookingDialogOpen(true),
    handleCloseBooking: () => setBookingDialogOpen(false),
    handleContactProvider,
    handleEdit,
  };
}
