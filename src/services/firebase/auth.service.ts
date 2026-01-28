/**
 * Firebase Authentication service
 */
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from './config';
import type { AppUser } from '../../types/user.types';
import { Collections } from '../../utils/constants';
import { logError } from '../../utils/errorHandlers';

/**
 * Sign up with email and password
 */
export const signUp = async (
  email: string,
  password: string,
  displayName: string
): Promise<AppUser> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // Update profile with display name
    await updateProfile(user, { displayName });

    // Create user document in Firestore
    const newUser: AppUser = {
      id: user.uid,
      email: user.email || email,
      displayName,
      photoUrl: user.photoURL || undefined,
      isProvider: false,
      providerStatus: 'none',
      role: 'user',
    };

    await setDoc(doc(db, Collections.USERS, user.uid), {
      email: newUser.email,
      displayName: newUser.displayName,
      photoUrl: newUser.photoUrl,
      isProvider: newUser.isProvider,
      providerStatus: newUser.providerStatus,
      role: newUser.role,
      createdAt: new Date().toISOString(),
    });

    return newUser;
  } catch (error) {
    logError(error, 'signUp');
    throw error;
  }
};

/**
 * Sign in with email and password
 */
export const signIn = async (
  email: string,
  password: string
): Promise<AppUser> => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // Fetch user data from Firestore
    const userDoc = await getDoc(doc(db, Collections.USERS, user.uid));

    if (!userDoc.exists()) {
      throw new Error('User document not found');
    }

    const userData = userDoc.data();

    return {
      id: user.uid,
      email: user.email || email,
      displayName: user.displayName || userData.displayName,
      photoUrl: user.photoURL || userData.photoUrl,
      city: userData.city,
      latitude: userData.latitude,
      longitude: userData.longitude,
      fcmToken: userData.fcmToken,
      isProvider: userData.isProvider || false,
      providerStatus: userData.providerStatus || 'none',
      role: userData.role || 'user',
    };
  } catch (error) {
    logError(error, 'signIn');
    throw error;
  }
};

/**
 * Sign out
 */
export const signOut = async (): Promise<void> => {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    logError(error, 'signOut');
    throw error;
  }
};

/**
 * Get current user
 */
export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};

/**
 * Subscribe to auth state changes
 */
export const onAuthStateChange = (
  callback: (user: User | null) => void
): (() => void) => {
  return onAuthStateChanged(auth, callback);
};

/**
 * Get current user ID
 */
export const getCurrentUserId = (): string | null => {
  return auth.currentUser?.uid || null;
};
