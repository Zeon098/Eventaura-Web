/**
 * Provider request service for managing provider status requests
 */
import {
  
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from './config';
import { Collections } from '../../utils/constants';
import { logError } from '../../utils/errorHandlers';
import { notifyProviderApproval } from './notification.service';

export interface ProviderRequest {
  userId: string;
  businessName: string;
  description: string;
  cnicFrontUrl: string;
  cnicBackUrl: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Submit a provider request
 */
export const submitProviderRequest = async (
  userId: string,
  businessName: string,
  description: string,
  cnicFrontUrl: string,
  cnicBackUrl: string
): Promise<void> => {
  try {
    const requestRef = doc(db, Collections.PROVIDER_REQUESTS, userId);
    
    // Check if request already exists
    const existingDoc = await getDoc(requestRef);
    
    if (existingDoc.exists() && existingDoc.data()?.status === 'pending') {
      throw new Error('A request is already pending for this user');
    }
    
    const requestData = {
      userId,
      businessName,
      description,
      cnicFrontUrl,
      cnicBackUrl,
      status: 'pending',
      rejectionReason: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    
    await setDoc(requestRef, requestData);
  } catch (error) {
    logError(error, 'submitProviderRequest');
    throw error;
  }
};

/**
 * Get a provider request by user ID
 */
export const getProviderRequest = async (
  userId: string
): Promise<ProviderRequest | null> => {
  try {
    const requestRef = doc(db, Collections.PROVIDER_REQUESTS, userId);
    const requestDoc = await getDoc(requestRef);
    
    if (!requestDoc.exists()) {
      return null;
    }
    
    const data = requestDoc.data();
    
    return {
      userId: data.userId,
      businessName: data.businessName,
      description: data.description,
      cnicFrontUrl: data.cnicFrontUrl,
      cnicBackUrl: data.cnicBackUrl,
      status: data.status,
      rejectionReason: data.rejectionReason,
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt),
      updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(data.updatedAt),
    };
  } catch (error) {
    logError(error, `getProviderRequest: ${userId}`);
    throw error;
  }
};

/**
 * Approve a provider request
 * This updates both the provider_requests collection and the users collection
 */
export const approveProviderRequest = async (
  userId: string
): Promise<void> => {
  try {
    const requestRef = doc(db, Collections.PROVIDER_REQUESTS, userId);
    const userRef = doc(db, Collections.USERS, userId);
    
    // Update provider request status
    await updateDoc(requestRef, {
      status: 'approved',
      updatedAt: serverTimestamp(),
    });
    
    // Update user profile
    await updateDoc(userRef, {
      isProvider: true,
      providerStatus: 'approved',
      role: 'provider',
      updatedAt: serverTimestamp(),
    });
    
    // Send push notification
    await notifyProviderApproval(userId, true);
  } catch (error) {
    logError(error, `approveProviderRequest: ${userId}`);
    throw error;
  }
};

/**
 * Reject a provider request
 */
export const rejectProviderRequest = async (
  userId: string,
  rejectionReason: string
): Promise<void> => {
  try {
    const requestRef = doc(db, Collections.PROVIDER_REQUESTS, userId);
    const userRef = doc(db, Collections.USERS, userId);
    
    // Update provider request status
    await updateDoc(requestRef, {
      status: 'rejected',
      rejectionReason,
      updatedAt: serverTimestamp(),
    });
    
    // Update user profile
    await updateDoc(userRef, {
      providerStatus: 'rejected',
      updatedAt: serverTimestamp(),
    });
    
    // Send push notification
    await notifyProviderApproval(userId, false);
  } catch (error) {
    logError(error, `rejectProviderRequest: ${userId}`);
    throw error;
  }
};
