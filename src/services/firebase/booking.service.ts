/**
 * Booking service for managing service bookings with overlap checking
 */
import {
  collection,
  doc,
  getDocs,
  query,
  where,
  orderBy,
  runTransaction,
  serverTimestamp,
  Timestamp,
  updateDoc,
  getDoc,
  onSnapshot,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from './config';
import type { BookingModel, CreateBookingInput } from '../../types/booking.types';
import { Collections } from '../../utils/constants';
import { logError } from '../../utils/errorHandlers';

/**
 * Format date to yyyy-MM-dd for querying
 */
const formatDateKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Check if two time ranges overlap
 */
const hasTimeOverlap = (
  start1: Date,
  end1: Date,
  start2: Date,
  end2: Date
): boolean => {
  // Overlap occurs if: start1 < end2 AND end1 > start2
  return start1 < end2 && end1 > start2;
};

/**
 * Check if provider has booking conflicts on the given date/time
 */
export const checkBookingOverlap = async (
  providerId: string,
  date: Date,
  startTime: Date,
  endTime: Date
): Promise<boolean> => {
  try {
    const dateString = formatDateKey(date);
    const bookingsRef = collection(db, Collections.BOOKINGS);
    
    // Query all bookings for this provider on the same date
    const q = query(
      bookingsRef,
      where('providerId', '==', providerId),
      where('date', '==', dateString)
    );
    
    const snapshot = await getDocs(q);
    
    // Check for time overlap in memory
    for (const doc of snapshot.docs) {
      const booking = doc.data();
      
      // Only check pending or accepted bookings
      if (booking.status !== 'pending' && booking.status !== 'accepted') {
        continue;
      }
      
      const existingStart = booking.startTime instanceof Timestamp 
        ? booking.startTime.toDate() 
        : new Date(booking.startTime);
      
      const existingEnd = booking.endTime instanceof Timestamp
        ? booking.endTime.toDate()
        : new Date(booking.endTime);
      
      if (hasTimeOverlap(existingStart, existingEnd, startTime, endTime)) {
        return true; // Conflict found
      }
    }
    
    return false; // No conflicts
  } catch (error) {
    logError(error, 'checkBookingOverlap');
    throw error;
  }
};

/**
 * Create a new booking with transaction to prevent race conditions
 */
export const createBooking = async (
  input: CreateBookingInput
): Promise<string> => {
  try {
    return await runTransaction(db, async (transaction) => {
      const dateString = formatDateKey(input.date);
      const bookingsRef = collection(db, Collections.BOOKINGS);
      
      // Query existing bookings for overlap check
      const q = query(
        bookingsRef,
        where('providerId', '==', input.providerId),
        where('date', '==', dateString)
      );
      
      const snapshot = await getDocs(q);
      
      // Check for time overlap
      for (const doc of snapshot.docs) {
        const booking = doc.data();
        
        if (booking.status === 'pending' || booking.status === 'accepted') {
          const existingStart = booking.startTime instanceof Timestamp
            ? booking.startTime.toDate()
            : new Date(booking.startTime);
          
          const existingEnd = booking.endTime instanceof Timestamp
            ? booking.endTime.toDate()
            : new Date(booking.endTime);
          
          if (hasTimeOverlap(existingStart, existingEnd, input.startTime, input.endTime)) {
            throw new Error('Time slot already booked');
          }
        }
      }
      
      // Create new booking
      const newBookingRef = doc(bookingsRef);
      
      const bookingData = {
        serviceId: input.serviceId,
        consumerId: input.consumerId,
        providerId: input.providerId,
        // Single category fields (primary category)
        categoryId: input.categoryId,
        categoryName: input.categoryName,
        categoryPrice: input.categoryPrice,
        // Multi-category fields
        categoryIds: input.categoryIds,
        categoryNames: input.categoryNames,
        totalPrice: input.totalPrice,
        date: dateString,
        startTime: input.startTime,
        endTime: input.endTime,
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      
      transaction.set(newBookingRef, bookingData);
      
      return newBookingRef.id;
    });
  } catch (error) {
    logError(error, 'createBooking');
    throw error;
  }
};

/**
 * Get a booking by ID
 */
export const getBooking = async (bookingId: string): Promise<BookingModel | null> => {
  try {
    const bookingRef = doc(db, Collections.BOOKINGS, bookingId);
    const bookingDoc = await getDoc(bookingRef);
    
    if (!bookingDoc.exists()) {
      return null;
    }
    
    const data = bookingDoc.data();
    
    return {
      id: bookingDoc.id,
      serviceId: data.serviceId,
      consumerId: data.consumerId,
      providerId: data.providerId,
      categoryId: data.categoryId,
      categoryName: data.categoryName,
      categoryPrice: data.categoryPrice,
      categoryIds: data.categoryIds || [],
      categoryNames: data.categoryNames || [],
      totalPrice: data.totalPrice,
      date: data.date,
      status: data.status,
      startTime: data.startTime instanceof Timestamp ? data.startTime.toDate() : new Date(data.startTime),
      endTime: data.endTime instanceof Timestamp ? data.endTime.toDate() : new Date(data.endTime),
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt),
      updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(data.updatedAt),
    } as BookingModel;
  } catch (error) {
    logError(error, `getBooking: ${bookingId}`);
    throw error;
  }
};

/**
 * Update booking status
 */
export const updateBookingStatus = async (
  bookingId: string,
  status: string
): Promise<void> => {
  try {
    const bookingRef = doc(db, Collections.BOOKINGS, bookingId);
    await updateDoc(bookingRef, {
      status,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    logError(error, `updateBookingStatus: ${bookingId}`);
    throw error;
  }
};

/**
 * Watch user's bookings (as consumer)
 */
export const subscribeToConsumerBookings = (
  consumerId: string,
  statuses: string[] | null,
  onUpdate: (bookings: BookingModel[]) => void,
  onError?: (error: Error) => void
): Unsubscribe => {
  const bookingsRef = collection(db, Collections.BOOKINGS);
  
  const q = query(
    bookingsRef,
    where('consumerId', '==', consumerId),
    orderBy('createdAt', 'desc')
  );
  
  return onSnapshot(
    q,
    (snapshot) => {
      console.log(`Received ${snapshot.docs.length} bookings for consumer ${consumerId}`);
      let bookings = snapshot.docs.map((doc) => {
        const data = doc.data();
        console.log(`Booking ${doc.id} status: ${data.status}`, data);
        return {
          id: doc.id,
          serviceId: data.serviceId,
          consumerId: data.consumerId,
          providerId: data.providerId,
          categoryId: data.categoryId,
          categoryName: data.categoryName,
          categoryPrice: data.categoryPrice,
          categoryIds: data.categoryIds || [],
          categoryNames: data.categoryNames || [],
          totalPrice: data.totalPrice,
          date: data.date,
          status: data.status,
          startTime: data.startTime instanceof Timestamp ? data.startTime.toDate() : new Date(data.startTime),
          endTime: data.endTime instanceof Timestamp ? data.endTime.toDate() : new Date(data.endTime),
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt),
          updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(data.updatedAt),
        } as BookingModel;
      });
      
      console.log(`Total bookings before filter: ${bookings.length}`);
      console.log(`Filter statuses:`, statuses);
      
      // Filter by status in-memory to avoid composite index
      if (statuses && statuses.length > 0) {
        bookings = bookings.filter(booking => statuses.includes(booking.status));
        console.log(`Bookings after filter: ${bookings.length}`);
      }
      
      onUpdate(bookings);
    },
    (error) => {
      logError(error, 'subscribeToConsumerBookings');
      if (onError) onError(error);
    }
  );
};

/**
 * Watch provider's bookings
 */
export const subscribeToProviderBookings = (
  providerId: string,
  statuses: string[] | null,
  onUpdate: (bookings: BookingModel[]) => void,
  onError?: (error: Error) => void
): Unsubscribe => {
  const bookingsRef = collection(db, Collections.BOOKINGS);
  
  const q = query(
    bookingsRef,
    where('providerId', '==', providerId),
    orderBy('createdAt', 'desc')
  );
  
  return onSnapshot(
    q,
    (snapshot) => {
      let bookings = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          serviceId: data.serviceId,
          consumerId: data.consumerId,
          providerId: data.providerId,
          categoryId: data.categoryId,
          categoryName: data.categoryName,
          categoryPrice: data.categoryPrice,
          categoryIds: data.categoryIds || [],
          categoryNames: data.categoryNames || [],
          totalPrice: data.totalPrice,
          date: data.date,
          status: data.status,
          startTime: data.startTime instanceof Timestamp ? data.startTime.toDate() : new Date(data.startTime),
          endTime: data.endTime instanceof Timestamp ? data.endTime.toDate() : new Date(data.endTime),
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt),
          updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(data.updatedAt),
        } as BookingModel;
      });
      
      // Filter by status in-memory to avoid composite index
      if (statuses && statuses.length > 0) {
        bookings = bookings.filter(booking => statuses.includes(booking.status));
      }
      
      onUpdate(bookings);
    },
    (error) => {
      logError(error, 'subscribeToProviderBookings');
      if (onError) onError(error);
    }
  );
};

/**
 * Get bookings by provider and date (for checking availability)
 */
export const getBookingsByProviderAndDate = async (
  providerId: string,
  date: Date
): Promise<BookingModel[]> => {
  try {
    const dateString = formatDateKey(date);
    const bookingsRef = collection(db, Collections.BOOKINGS);
    
    const q = query(
      bookingsRef,
      where('providerId', '==', providerId),
      where('date', '==', dateString)
    );
    
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        serviceId: data.serviceId,
        consumerId: data.consumerId,
        providerId: data.providerId,
        categoryId: data.categoryId,
        categoryName: data.categoryName,
        categoryPrice: data.categoryPrice,
        categoryIds: data.categoryIds || [],
        categoryNames: data.categoryNames || [],
        totalPrice: data.totalPrice,
        date: data.date,
        status: data.status,
        startTime: data.startTime instanceof Timestamp ? data.startTime.toDate() : new Date(data.startTime),
        endTime: data.endTime instanceof Timestamp ? data.endTime.toDate() : new Date(data.endTime),
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt),
        updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(data.updatedAt),
      } as BookingModel;
    });
  } catch (error) {
    logError(error, 'getBookingsByProviderAndDate');
    throw error;
  }
};
