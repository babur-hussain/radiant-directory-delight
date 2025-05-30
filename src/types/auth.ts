
export interface User {
  uid: string;
  id: string;
  email: string;
  name: string;
  role: UserRole;
  isAdmin?: boolean;
  phone?: string;
  createdAt?: string;
  updatedAt?: string;
  profileComplete?: boolean;
  businessDetails?: any;
  influencerDetails?: any;
  subscription?: any;
  employeeCode?: string;
}

export type UserRole = 'Business' | 'Influencer' | 'Admin' | 'Staff';

export interface SessionData {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  providerToken?: string | null;
  user: {
    id: string;
    email: string;
    phone: string;
    userMetadata: Record<string, any>;
    appMetadata: Record<string, any>;
    aud: string;
  };
}

export interface AuthContextType {
  currentUser: User | null;
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  isLoading: boolean; // Add this missing property
  initialized: boolean;
  login: (email: string, password: string, employeeCode?: string) => Promise<User | null>;
  loginWithGoogle: () => Promise<void>;
  signup: (
    email: string,
    password: string,
    name: string,
    role: UserRole,
    additionalData?: any
  ) => Promise<User | null>;
  logout: () => Promise<void>;
  refreshUserData: () => Promise<User | null>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
}
