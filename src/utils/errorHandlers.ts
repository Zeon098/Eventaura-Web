/**
 * Error handling utilities
 */
import { FirebaseError } from 'firebase/app';
import type { APIError } from '../types/common.types';

/**
 * Get user-friendly error message from Firebase error
 */
export const getFirebaseErrorMessage = (error: FirebaseError): string => {
  switch (error.code) {
    case 'auth/user-not-found':
      return 'No account found with this email';
    case 'auth/wrong-password':
      return 'Incorrect password';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters';
    case 'auth/invalid-email':
      return 'Invalid email address';
    case 'auth/user-disabled':
      return 'This account has been disabled';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later';
    case 'permission-denied':
      return 'You do not have permission to perform this action';
    case 'not-found':
      return 'The requested resource was not found';
    case 'already-exists':
      return 'This resource already exists';
    case 'unavailable':
      return 'Service temporarily unavailable. Please try again';
    default:
      return error.message || 'An unexpected error occurred';
  }
};

/**
 * Convert error to APIError type
 */
export const toAPIError = (error: unknown): APIError => {
  if (error instanceof FirebaseError) {
    return {
      code: error.code,
      message: getFirebaseErrorMessage(error),
      details: error,
    };
  }
  
  if (error instanceof Error) {
    return {
      code: 'unknown',
      message: error.message,
      details: error,
    };
  }
  
  return {
    code: 'unknown',
    message: 'An unexpected error occurred',
    details: error,
  };
};

/**
 * Log error to console (can be extended to send to error tracking service)
 */
export const logError = (error: unknown, context?: string): void => {
  console.error(`[Error${context ? ` in ${context}` : ''}]:`, error);
  
  // TODO: Send to error tracking service (e.g., Sentry)
};

/**
 * Handle async errors with toast notification
 */
export const handleAsyncError = async <T>(
  promise: Promise<T>,
  errorMessage?: string
): Promise<T | null> => {
  try {
    return await promise;
  } catch (error) {
    logError(error, errorMessage);
    return null;
  }
};
