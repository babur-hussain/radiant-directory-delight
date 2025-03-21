
export type UserRole = "User" | "Business" | "Influencer" | "Staff" | "Admin";

export interface User {
  uid: string;
  id: string;
  email: string;
  displayName: string | null;
  name: string | null;
  role: UserRole;
  isAdmin: boolean;
  photoURL: string | null;
  createdAt: string;
  lastLogin: string;
  
  // Common optional fields
  employeeCode?: string | null;
  phone?: string | null;
  
  // User-specific fields
  fullName?: string | null;
  
  // Influencer-specific fields
  instagramHandle?: string | null;
  facebookHandle?: string | null;
  verified?: boolean;
  city?: string | null;
  country?: string | null;
  niche?: string | null;
  followersCount?: string | null;
  bio?: string | null;
  
  // Business-specific fields
  businessName?: string | null;
  ownerName?: string | null;
  businessCategory?: string | null;
  website?: string | null;
  address?: string | null;
  gstNumber?: string | null;
  
  // Subscription-related fields
  subscription?: string | null;
  subscriptionId?: string | null;
  subscriptionStatus?: string | null;
  subscriptionPackage?: string | null;
  customDashboardSections?: string[] | null;
}

export interface AuthContextType {
  user: User | null;
  currentUser: User | null;
  loading: boolean;
  initialized: boolean;
  userRole: UserRole | null;
  isAdmin: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string, employeeCode?: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  signup: (email: string, password: string, name: string, role: UserRole, additionalData?: any) => Promise<void>;
  updateUserData: (data: Partial<User>) => Promise<void>;
  updateUserRole: (user: User, role: UserRole) => Promise<User>;
  updateUserPermission: (userId: string, isAdmin: boolean) => Promise<{userId: string, isAdmin: boolean}>;
}
