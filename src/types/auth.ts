
export type UserRole = 'User' | 'Business' | 'Influencer' | 'Staff' | 'Admin' | null;

export interface User {
  uid: string;
  id: string;
  email: string;
  displayName: string;
  name: string;
  photoURL: string | null;
  role: UserRole;
  isAdmin: boolean;
  createdAt: string;
  lastLogin: string;
  employeeCode?: string;
  subscription?: UserSubscription | string;
  subscriptionId?: string;
  subscriptionStatus?: SubscriptionStatus;
  subscriptionPackage?: string;
  [key: string]: any;
}

export interface SessionUser {
  id: string;
  email: string;
  phone: string;
  userMetadata: Record<string, any>;
  appMetadata: Record<string, any>;
  aud: string;
}

export interface SessionData {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  providerToken: string | null;
  user: SessionUser;
}

export type SubscriptionStatus = 'active' | 'inactive' | 'pending' | 'cancelled' | 'expired' | 'trial' | 'paused';

export type PaymentType = 'recurring' | 'one-time';

export interface UserSubscription {
  id: string;
  userId: string;
  packageId: string;
  packageName: string;
  amount: number;
  startDate: string | Date;
  endDate?: string | Date;
  status: SubscriptionStatus;
  paymentType: PaymentType;
  paymentMethod?: string;
  transactionId?: string;
  cancelledAt?: string;
  cancelReason?: string;
  packageDetails?: any;
  paymentStatus?: string;
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
  billingCycle?: string;
  recurringAmount?: number;
  nextBillingDate?: string;
  [key: string]: any;
}

export interface AuthContextType {
  currentUser: User | null;
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  initialized: boolean;
  login: (email: string, password: string, employeeCode?: string) => Promise<User | null>;
  loginWithGoogle: () => Promise<void>;
  signup: (email: string, password: string, name: string, role: UserRole, additionalData?: any) => Promise<User | null>;
  logout: () => Promise<void>;
  refreshUserData: () => Promise<User | null>;
}

export const DEFAULT_ADMIN_EMAIL = "admin@example.com";

export const isDefaultAdminEmail = (email: string): boolean => {
  return email.toLowerCase() === DEFAULT_ADMIN_EMAIL.toLowerCase();
};

/**
 * Utility function to check if a value is a UserSubscription object
 */
export const isUserSubscription = (value: any): value is UserSubscription => {
  return value && 
    typeof value === 'object' && 
    'packageId' in value && 
    'userId' in value && 
    'status' in value;
};
