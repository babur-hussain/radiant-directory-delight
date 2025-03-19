
import { User as FirebaseUser } from 'firebase/auth';

// User roles enum for type safety
export type UserRole = 'Admin' | 'Business' | 'Influencer' | 'User' | 'staff' | null;

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
  
  // Added fields from MongoDB model
  name?: string | null;
  id?: string; // Virtual field for compatibility with Firestore IDs
  lastLogin?: Date | string;
  subscription?: string | null;
  subscriptionId?: string;
  subscriptionStatus?: string;
  subscriptionPackage?: string;
  customDashboardSections?: string[];
  
  // Shared fields
  phone?: string;
  instagramHandle?: string;
  facebookHandle?: string;
  verified?: boolean;
  city?: string;
  country?: string;
  
  // Influencer specific fields
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
  
  // Optional properties for role management (may be implemented)
  updateUserRole?: (user: User, role: UserRole) => Promise<User>;
  updateUserPermission?: (userId: string, isAdmin: boolean) => Promise<{userId: string, isAdmin: boolean}>;
}
