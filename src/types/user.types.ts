/**
 * User data model matching Flutter AppUser
 */
export interface AppUser {
  id: string;
  email: string;
  displayName?: string;
  photoUrl?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  fcmToken?: string;
  isProvider: boolean;
  providerStatus: 'none' | 'pending' | 'approved' | 'rejected';
  role: 'user' | 'provider' | 'admin';
}

/**
 * Provider request model for becoming a service provider
 */
export interface ProviderRequest {
  id: string;
  userId: string;
  businessName: string;
  description: string;
  cnicFrontUrl: string;
  cnicBackUrl: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
