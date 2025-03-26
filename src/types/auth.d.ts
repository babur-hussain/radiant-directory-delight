export type UserRole = "User" | "Business" | "Influencer" | "Staff" | "Admin" | null;

export interface User {
  id: string;
  uid: string;
  email: string;
  displayName?: string;
  name?: string | null;
  photoURL?: string | null;
  isAdmin?: boolean;
  role?: UserRole;
  createdAt?: string;
  lastLogin?: string;
  employeeCode?: string | null;
  
  // Shared fields
  phone?: string | null;
  instagramHandle?: string | null;
  facebookHandle?: string | null;
  facebookProfile?: string | null;
  verified?: boolean;
  city?: string | null;
  country?: string | null;
  location?: string | null;
  
  // User specific fields
  interests?: string | null;
  preferredLanguage?: string | null;
  
  // Influencer specific fields
  niche?: string | null;
  category?: string | null;
  followersCount?: string | null;
  engagementRate?: string | null;
  bio?: string | null;
  
  // Business specific fields
  businessName?: string | null;
  ownerName?: string | null;
  businessCategory?: string | null;
  websiteURL?: string | null;
  socialMediaLinks?: string | null;
  GSTIN?: string | null;
  website?: string | null;
  address?: {
    street?: string | null;
    city?: string | null;
    state?: string | null;
    country?: string | null;
    zipCode?: string | null;
  } | string;
  businessAddress?: string | null;
  gstNumber?: string | null;
  
  // Staff specific fields
  staffRole?: string | null;
  assignedBusinessID?: string | null;
  
  // Subscription related
  subscription?: string | Record<string, any> | null;
  subscriptionId?: string | null;
  subscriptionStatus?: string | null;
  subscriptionPackage?: string | null;
  customDashboardSections?: string[] | null;
}

export interface AuthContextType {
  currentUser: User | null;
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  initialized: boolean;
  error: Error | null;
  login: (email: string, password: string, employeeCode?: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  signup: (email: string, password: string, userData?: Partial<User>) => Promise<void>;
  logout: () => Promise<void>;
  refreshUserData: () => Promise<void>;
  resetPassword: (email: string) => Promise<boolean>;
  updateUserProfile: (data: Partial<User>) => Promise<User | null>;
}

export interface UserSubscription {
  id: string;
  name: string;
  status: string;
  startDate: string;
  endDate: string;
  price: number;
}
