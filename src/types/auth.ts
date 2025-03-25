
export type UserRole = 'admin' | 'user' | 'business' | 'influencer' | 'staff';

export interface User {
  id: string;
  uid?: string;
  email?: string;
  displayName?: string;
  name?: string;
  role?: UserRole;
  isAdmin?: boolean;
  is_admin?: boolean;
  photoURL?: string;
  photo_url?: string;
  createdAt?: string;
  created_at?: string;
  lastLogin?: string;
  last_login?: string;
  phone?: string;
  provider?: string;
  
  // Additional fields for different user types
  employeeCode?: string;
  employee_code?: string;
  city?: string;
  country?: string;
  verified?: boolean;
  website?: string;
  
  // Social media
  instagramHandle?: string;
  instagram_handle?: string;
  facebookHandle?: string;
  facebook_handle?: string;
  
  // Address
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
  } | string;
  
  // Influencer fields
  niche?: string;
  followersCount?: string;
  followers_count?: string;
  bio?: string;
  
  // Business fields
  businessName?: string;
  business_name?: string;
  ownerName?: string;
  owner_name?: string;
  businessCategory?: string;
  business_category?: string;
  gstNumber?: string;
  gst_number?: string;
  
  // Subscription related
  subscription?: string | Record<string, any>;
  subscription_id?: string;
  subscriptionId?: string;
  subscription_status?: string;
  subscriptionStatus?: string;
  subscription_package?: string;
  subscriptionPackage?: string;
  custom_dashboard_sections?: string[];
  customDashboardSections?: string[];
  
  // For Razorpay integration
  fullName?: string;
}

export interface AuthContextType {
  user: User | null;
  currentUser?: User | null; // Added for compatibility
  isAuthenticated: boolean;
  isLoading?: boolean;
  loading?: boolean; // Added for compatibility
  initialized?: boolean; // Added for compatibility
  error: Error | null;
  login: (email: string, password: string, employeeCode?: string) => Promise<void>;
  loginWithGoogle?: () => Promise<void>; // Added for compatibility
  signup: (email: string, password: string, userData?: Partial<User>) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (data: Partial<User>) => Promise<void>;
}

// Additional types for subscriptions
export interface UserSubscription {
  id: string;
  name: string;
  status: string;
  startDate: string;
  endDate: string;
  price: number;
  packageId?: string;
  userId?: string;
}

export type SubscriptionStatus = 'active' | 'expired' | 'cancelled' | 'pending';

// Type guard for UserSubscription
export function isUserSubscription(obj: any): obj is UserSubscription {
  return (
    obj &&
    typeof obj === 'object' &&
    'id' in obj &&
    'status' in obj
  );
}

// Type for session data
export interface SessionData {
  user: User | null;
  isAuthenticated: boolean;
}
