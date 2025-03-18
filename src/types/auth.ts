
// Define types for our auth context
export type UserRole = "Business" | "Influencer" | "Admin" | "User" | "admin" | "staff" | null;

export interface User {
  uid: string;
  id?: string; // Alias for uid for compatibility
  email: string | null;
  displayName: string | null; 
  name?: string | null; // Alias for displayName for compatibility
  photoURL: string | null;
  role?: UserRole;
  isAdmin?: boolean;
  subscription?: any; // For storing subscription information
  createdAt?: Date | string; // For storing user creation date
  lastLogin?: Date | string; // For storing user's last login date
  
  // Additional fields for user profiles
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

export interface Subscription {
  id: string;
  userId: string;
  packageId: string;
  packageName: string;
  amount: number;
  startDate: Date | string;
  endDate: Date | string;
  status: string;
  // New fields for Razorpay integration - making all optional for backward compatibility
  advancePaymentMonths?: number;
  signupFee?: number;
  actualStartDate?: Date | string;
  isPaused?: boolean;
  isPausable?: boolean;
  isUserCancellable?: boolean;
  invoiceIds?: string[];
  pausedAt?: Date | string;
  resumedAt?: Date | string;
  paymentType?: "recurring" | "one-time";
}

export interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  userRole: UserRole | null;
  isAdmin: boolean;
  logout: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle?: () => Promise<void>;
  signup?: (email: string, password: string, name: string, role: UserRole, additionalData?: any) => Promise<any>;
  updateUserRole?: (role: UserRole) => Promise<void>;
  updateUserPermission?: (userId: string, isAdmin: boolean) => Promise<void>;
  isAuthenticated?: boolean;
  initialized?: boolean;
  user?: User | null;
}
