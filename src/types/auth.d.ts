
export type UserRole = "User" | "Business" | "Influencer" | "Staff" | "Admin";

export type SubscriptionStatus = 'active' | 'inactive' | 'cancelled' | 'pending' | 'paused' | 'expired' | 'trial';
export type PaymentType = 'recurring' | 'one-time';

export interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  adminOnly?: boolean;
}

export interface SessionData {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  providerToken: string | null;
  user: {
    id: string;
    email: string;
    phone: string;
    userMetadata: Record<string, any>;
    appMetadata: Record<string, any>;
    aud: string;
  };
}

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
  preferredLanguage?: string | null;
  interests?: string | null;
  location?: string | null;
  
  // Influencer-specific fields
  instagramHandle?: string | null;
  facebookHandle?: string | null;
  verified?: boolean;
  city?: string | null;
  country?: string | null;
  niche?: string | null;
  followersCount?: string | null;
  bio?: string | null;
  engagementRate?: string | null;
  
  // Business-specific fields
  businessName?: string | null;
  ownerName?: string | null;
  businessCategory?: string | null;
  website?: string | null;
  address?: {
    street?: string | null;
    city?: string | null;
    state?: string | null;
    country?: string | null;
    zipCode?: string | null;
  } | null;
  gstNumber?: string | null;
  
  // Staff-specific fields
  staffRole?: string | null;
  assignedBusinessId?: string | null;
  
  // Subscription-related fields
  subscription?: UserSubscription | string | null;
  subscriptionId?: string | null;
  subscriptionStatus?: string | null;
  subscriptionPackage?: string | null;
  customDashboardSections?: string[] | null;
}

export interface UserSubscription {
  id: string;
  userId: string;
  packageId: string;
  packageName: string;
  amount: number;
  startDate: string | Date;
  endDate: string | Date;
  status: SubscriptionStatus;
  paymentStatus?: string;
  paymentMethod?: string;
  transactionId?: string;
  paymentType?: PaymentType;
  packageDetails?: any;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  cancelledAt?: string | Date;
  cancelReason?: string;
  assignedBy?: string;
  assignedAt?: string;
  
  // Fields for advanced payment structure
  advancePaymentMonths?: number; 
  signupFee?: number;
  actualStartDate?: string;
  isPaused?: boolean;
  pausedAt?: string;
  pausedBy?: string;
  resumedAt?: string;
  resumedBy?: string;
  isPausable?: boolean;
  isUserCancellable?: boolean;
  invoiceIds?: string[];
  razorpaySubscriptionId?: string;
  razorpayOrderId?: string;
  nextBillingDate?: string;
  recurringAmount?: number;
  billingCycle?: string;
}

export function isUserSubscription(value: any): value is UserSubscription {
  return (
    typeof value === 'object' &&
    value !== null &&
    'packageId' in value &&
    'startDate' in value &&
    'endDate' in value
  );
}

export interface AuthContextType {
  user: User | null;
  currentUser: User | null;
  loading: boolean;
  initialized: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string, employeeCode?: string) => Promise<User | null>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  signup: (email: string, password: string, name: string, role: UserRole, additionalData?: any) => Promise<User | null>;
  refreshUserData: () => Promise<User | null>;
}
