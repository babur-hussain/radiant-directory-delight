
export type UserRole = 'admin' | 'user' | 'business' | 'influencer';

export interface User {
  id: string;
  uid?: string;
  email?: string;
  displayName?: string;
  name?: string;
  role?: UserRole;
  isAdmin?: boolean;
  photoURL?: string;
  photo_url?: string;
  createdAt?: string;
  created_at?: string;
  lastSignInTime?: string;
  last_login?: string;
  phone?: string;
  provider?: string;
  businessName?: string;
  business_name?: string;
  profileCompleted?: boolean;
  subscription?: string;
  subscription_id?: string;
  subscription_status?: string;
  subscription_package?: string;
  is_active?: boolean;
  custom_dashboard_sections?: string[];
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: Error | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, userData?: Partial<User>) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (data: Partial<User>) => Promise<void>;
}
