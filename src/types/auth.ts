
import { User as SupabaseUser } from '@supabase/supabase-js';

// User roles enum for type safety
export type UserRole = 'Admin' | 'Business' | 'Influencer' | 'User' | 'staff' | null;

// Subscription interface for type safety
export interface UserSubscription {
  id: string;
  userId: string;
  packageId: string;
  packageName: string;
  amount: number;
  startDate: Date | string;
  endDate: Date | string;
  status: string;
  paymentMethod?: string;
  transactionId?: string;
  cancelledAt?: string;
  cancelReason?: string;
  paymentType?: "recurring" | "one-time";
  createdAt?: string | Date;
  updatedAt?: string | Date;
  [key: string]: any; // Allow additional properties
}

// Function to check if a subscription is a UserSubscription object
export function isUserSubscription(subscription: any): subscription is UserSubscription {
  return subscription && 
         typeof subscription === 'object' && 
         'packageId' in subscription && 
         'status' in subscription;
}

// Extended User interface
export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isAdmin: boolean;
  role: UserRole;
  employeeCode?: string | null;
  createdAt?: string;
  
  // Modified field from string to object
  subscription?: string | UserSubscription | null;
  subscriptionId?: string;
  subscriptionStatus?: string;
  subscriptionPackage?: string;
  customDashboardSections?: string[];
  
  // Added fields from Supabase
  name?: string | null;
  id?: string; // Virtual field for compatibility with Supabase IDs
  lastLogin?: Date | string;
  
  // Shared fields
  phone?: string;
  instagramHandle?: string;
  facebookHandle?: string;
  verified?: boolean;
  city?: string;
  country?: string;
  
  // Influencer specific fields
  fullName?: string;
  niche?: string;
  followersCount?: string;
  bio?: string;
  
  // Business specific fields
  businessName?: string;
  ownerName?: string;
  businessCategory?: string;
  website?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
  };
  gstNumber?: string;
}

// Auth context type for the context provider
export interface AuthContextType {
  user: User | null;
  currentUser: User | null; // Alias for user for compatibility
  isAuthenticated: boolean;
  loading: boolean;
  initialized: boolean;
  userRole: UserRole;
  isAdmin: boolean;
  
  // Auth methods
  login: (email: string, password: string, employeeCode?: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  signup: (
    email: string, 
    password: string, 
    name: string, 
    role: UserRole, 
    additionalData?: any
  ) => Promise<void>;
  
  // Role management
  updateUserRole?: (user: User, role: UserRole) => Promise<User>;
  updateUserPermission?: (userId: string, isAdmin: boolean) => Promise<{userId: string, isAdmin: boolean}>;
}
