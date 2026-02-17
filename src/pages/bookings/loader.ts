import { useMemo } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useFirebaseSubscription } from '../../hooks/useFirebaseSubscription';
import { subscribeToConsumerBookings, subscribeToProviderBookings, updateBookingStatus } from '../../services/firebase/booking.service';
import type { BookingModel } from '../../types/booking.types';
import { BookingStatus } from '../../utils/constants';
import toast from 'react-hot-toast';

type TaggedBooking = BookingModel & { isIncoming: boolean };

/* ── Real-time subscription → React Query cache ─────── */

export const useBookings = (userId: string | undefined) => {
  // Bookings merges TWO subscriptions, so we wrap the merge logic
  // inside a single subscribeFn passed to useFirebaseSubscription.
  const { data, loading, error } = useFirebaseSubscription<TaggedBooking[]>(
    ['bookings', userId],
    (onData) => {
      let consumer: TaggedBooking[] = [];
      let provider: TaggedBooking[] = [];
      let consumerReady = false;
      let providerReady = false;

      const merge = () => {
        if (!consumerReady || !providerReady) return;
        const combined = [...consumer, ...provider].sort(
          (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
        );
        onData(combined);
      };

      const unSubConsumer = subscribeToConsumerBookings(userId!, null,
        (d) => { consumer = d.map(b => ({ ...b, isIncoming: false })); consumerReady = true; merge(); },
        () => { consumerReady = true; merge(); },
      );

      const unSubProvider = subscribeToProviderBookings(userId!, null,
        (d) => { provider = d.map(b => ({ ...b, isIncoming: true })); providerReady = true; merge(); },
        () => { providerReady = true; merge(); },
      );

      return () => { unSubConsumer(); unSubProvider(); };
    },
    { enabled: !!userId, fallback: [] },
  );

  return { allBookings: data ?? [], loading, error };
};

/* ── Derived state (pure computation — no change needed) ── */

const getStatusFilter = (tab: number): string[] => {
  switch (tab) {
    case 0: return [BookingStatus.PENDING];
    case 1: return [BookingStatus.ACCEPTED];
    case 2: return [BookingStatus.REJECTED, BookingStatus.COMPLETED, BookingStatus.CANCELLED];
    default: return [];
  }
};

export const useFilteredBookings = (allBookings: TaggedBooking[], activeTab: number) =>
  useMemo(() => {
    const statuses = getStatusFilter(activeTab);
    return allBookings.filter(b => statuses.includes(b.status));
  }, [allBookings, activeTab]);

export const useBookingStats = (allBookings: TaggedBooking[]) =>
  useMemo(() => {
    const pending = allBookings.filter(b => b.status === BookingStatus.PENDING).length;
    const upcoming = allBookings.filter(b => b.status === BookingStatus.ACCEPTED).length;
    const completed = allBookings.filter(b => b.status === BookingStatus.COMPLETED).length;
    const history = allBookings.length - pending - upcoming;
    return { pending, upcoming, completed, history, total: allBookings.length };
  }, [allBookings]);

/* ── Mutation for status update ─────────────────────── */

export const useUpdateBookingStatus = () => {
  const mutation = useMutation({
    mutationFn: ({ bookingId, newStatus }: { bookingId: string; newStatus: string }) =>
      updateBookingStatus(bookingId, newStatus),
    onError: () => toast.error('Failed to update booking status'),
  });

  return {
    updateStatus: (bookingId: string, newStatus: string) =>
      mutation.mutateAsync({ bookingId, newStatus }),
    isUpdating: mutation.isPending,
  };
};
