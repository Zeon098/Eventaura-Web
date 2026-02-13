import { useState, useEffect, useMemo, useCallback } from 'react';
import { subscribeToConsumerBookings, subscribeToProviderBookings, updateBookingStatus } from '../../services/firebase/booking.service';
import type { BookingModel } from '../../types/booking.types';
import { BookingStatus } from '../../utils/constants';

/**
 * Custom hook for subscribing to user's bookings (both incoming and outgoing) in real-time
 * Combines consumer and provider bookings into a single sorted list
 */
export const useBookings = (userId: string | undefined) => {
  const [allBookings, setAllBookings] = useState<(BookingModel & { isIncoming: boolean })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    let combinedBookings: (BookingModel & { isIncoming: boolean })[] = [];
    let consumerLoaded = false;
    let providerLoaded = false;

    const updateCombined = () => {
      if (consumerLoaded && providerLoaded) {
        combinedBookings.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        console.log(`Loaded ${combinedBookings.length} total bookings (incoming + outgoing):`, combinedBookings);
        setAllBookings(combinedBookings);
        setLoading(false);
      }
    };

    // Subscribe to consumer bookings (outgoing - bookings this user made)
    const unsubscribeConsumer = subscribeToConsumerBookings(
      userId,
      null,
      (bookingsData) => {
        const outgoingBookings = bookingsData.map(b => ({ ...b, isIncoming: false }));
        combinedBookings = combinedBookings.filter(b => b.isIncoming).concat(outgoingBookings);
        consumerLoaded = true;
        updateCombined();
      },
      (err) => {
        console.error('Error loading consumer bookings:', err);
        consumerLoaded = true;
        updateCombined();
      }
    );

    // Subscribe to provider bookings (incoming - bookings from customers)
    const unsubscribeProvider = subscribeToProviderBookings(
      userId,
      null,
      (bookingsData) => {
        const incomingBookings = bookingsData.map(b => ({ ...b, isIncoming: true }));
        combinedBookings = combinedBookings.filter(b => !b.isIncoming).concat(incomingBookings);
        providerLoaded = true;
        updateCombined();
      },
      (err) => {
        console.error('Error loading provider bookings:', err);
        providerLoaded = true;
        updateCombined();
      }
    );

    return () => {
      unsubscribeConsumer();
      unsubscribeProvider();
    };
  }, [userId]);

  return { allBookings, loading, error };
};

/**
 * Derives filtered bookings based on active tab
 */
const getStatusFilter = (tab: number): string[] => {
  switch (tab) {
    case 0: return [BookingStatus.PENDING];
    case 1: return [BookingStatus.ACCEPTED];
    case 2: return [BookingStatus.REJECTED, BookingStatus.COMPLETED, BookingStatus.CANCELLED];
    default: return [];
  }
};

export const useFilteredBookings = (allBookings: (BookingModel & { isIncoming: boolean })[], activeTab: number) => {
  return useMemo(() => {
    const statusFilter = getStatusFilter(activeTab);
    return allBookings.filter(booking => statusFilter.includes(booking.status));
  }, [allBookings, activeTab]);
};

/**
 * Derives booking statistics from all bookings
 */
export const useBookingStats = (allBookings: (BookingModel & { isIncoming: boolean })[]) => {
  return useMemo(() => {
    const pending = allBookings.filter(b => b.status === BookingStatus.PENDING).length;
    const upcoming = allBookings.filter(b => b.status === BookingStatus.ACCEPTED).length;
    const completed = allBookings.filter(b => b.status === BookingStatus.COMPLETED).length;
    const history = allBookings.length - pending - upcoming;
    const total = allBookings.length;
    return { pending, upcoming, completed, history, total };
  }, [allBookings]);
};

/**
 * Custom hook for updating booking status
 */
export const useUpdateBookingStatus = () => {
  const [isUpdating, setIsUpdating] = useState(false);

  const update = useCallback(async (bookingId: string, newStatus: string) => {
    setIsUpdating(true);
    try {
      await updateBookingStatus(bookingId, newStatus);
    } catch (error) {
      console.error('Error updating booking status:', error);
      alert('Failed to update booking status');
      throw error;
    } finally {
      setIsUpdating(false);
    }
  }, []);

  return { updateStatus: update, isUpdating };
};
