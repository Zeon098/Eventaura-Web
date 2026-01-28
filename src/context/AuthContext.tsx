/**
 * Authentication Context Provider
 */
import React, { createContext, useEffect, useState, type ReactNode } from 'react';
import type { User } from 'firebase/auth';
import * as authService from '../services/firebase/auth.service';
import type { AppUser } from '../types/user.types';
import { getDocument, updateDocument } from '../services/firebase/firestore.service';
import { Collections } from '../utils/constants';
import { logError } from '../utils/errorHandlers';

interface AuthContextType {
  user: AppUser | null;
  firebaseUser: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: (updates: Partial<AppUser>) => Promise<void>;
  refreshUser: () => Promise<void>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user data from Firestore
  const fetchUserData = async (uid: string): Promise<AppUser | null> => {
    try {
      const userData = await getDocument<AppUser>(Collections.USERS, uid);
      return userData;
    } catch (error) {
      logError(error, 'fetchUserData');
      return null;
    }
  };

  // Listen to auth state changes
  useEffect(() => {
    console.log('🔐 AuthContext: Setting up auth listener');
    const unsubscribe = authService.onAuthStateChange(async (firebaseUser) => {
      console.log('🔐 Auth state changed:', firebaseUser ? 'User logged in' : 'No user');
      setFirebaseUser(firebaseUser);

      if (firebaseUser) {
        // Fetch full user data from Firestore
        const userData = await fetchUserData(firebaseUser.uid);
        
        if (userData) {
          console.log('✅ User data loaded from Firestore');
          setUser(userData);
        } else {
          // Create default user if not found
          console.log('⚠️ User not found in Firestore, creating default user');
          const newUser: AppUser = {
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || undefined,
            photoUrl: firebaseUser.photoURL || undefined,
            isProvider: false,
            providerStatus: 'none',
            role: 'user',
          };
          setUser(newUser);
        }
      } else {
        console.log('👤 No user logged in');
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      console.log('🔐 AuthContext: Cleaning up auth listener');
      unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const userData = await authService.signIn(email, password);
      setUser(userData);
    } catch (error) {
      logError(error, 'signIn');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    try {
      setLoading(true);
      const userData = await authService.signUp(email, password, displayName);
      setUser(userData);
    } catch (error) {
      logError(error, 'signUp');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await authService.signOut();
      setUser(null);
      setFirebaseUser(null);
    } catch (error) {
      logError(error, 'signOut');
      throw error;
    }
  };

  const updateUser = async (updates: Partial<AppUser>) => {
    try {
      if (!user) throw new Error('No user logged in');

      await updateDocument(Collections.USERS, user.id, updates);

      // Update local state
      setUser({ ...user, ...updates });
    } catch (error) {
      logError(error, 'updateUser');
      throw error;
    }
  };

  const refreshUser = async () => {
    try {
      if (!firebaseUser) return;

      const userData = await fetchUserData(firebaseUser.uid);
      if (userData) {
        setUser(userData);
      }
    } catch (error) {
      logError(error, 'refreshUser');
    }
  };

  const value: AuthContextType = {
    user,
    firebaseUser,
    loading,
    signIn,
    signUp,
    signOut,
    updateUser,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
