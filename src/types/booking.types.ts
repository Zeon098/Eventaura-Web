/**
 * Booking status constants
 */
export const BookingStatus = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

export type BookingStatusType = typeof BookingStatus[keyof typeof BookingStatus];

/**
 * Booking model for service bookings
 */
export interface BookingModel {
  id: string;
  serviceId: string;
  consumerId: string;
  providerId: string;
  // Single category fields (primary/first category)
  categoryId: string;
  categoryName: string;
  categoryPrice: number;
  // Multi-category fields (all selected categories)
  categoryIds: string[];
  categoryNames: string[];
  totalPrice: number;
  date: string; // yyyy-MM-dd format
  startTime: Date;
  endTime: Date;
  createdAt: Date;
  updatedAt: Date;
  status: BookingStatusType;
}

/**
 * Booking creation payload
 */
export interface CreateBookingInput {
  serviceId: string;
  consumerId: string;
  providerId: string;
  categoryId: string; // Primary category
  categoryName: string;
  categoryPrice: number;
  categoryIds: string[]; // All selected categories
  categoryNames: string[];
  totalPrice: number;
  date: Date;
  startTime: Date;
  endTime: Date;
}
