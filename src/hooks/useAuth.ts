/**
 * useAuth hook - must be in a separate file for Fast Refresh
 */
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import type { AppUser } from '../types/user.types';
import type { User } from 'firebase/auth';

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

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
