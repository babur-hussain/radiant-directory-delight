export type UserRole = 'admin' | 'user' | 'business' | 'influencer' | 'staff';

export type ExtendedUserRole = UserRole | 'Admin' | 'User' | 'Business' | 'Influencer' | 'Staff';

export const isSameRoleIgnoreCase = (role1: string | undefined, role2: string | undefined): boolean => {
  if (!role1 || !role2) return false;
  return role1.toLowerCase() === role2.toLowerCase();
};

export const normalizeRole = (role: string | undefined): UserRole => {
  if (!role) return 'user';
  
  const normalizedRole = role.toLowerCase();
  
  switch (normalizedRole) {
    case 'admin':
      return 'admin';
    case 'business':
      return 'business';
    case 'influencer':
      return 'influencer';
    case 'staff':
      return 'staff';
    case 'user':
    default:
      return 'user';
  }
};

export const convertCapitalizedRole = (role: string | undefined): UserRole => {
  if (!role) return 'user';
  
  switch (role) {
    case 'Admin':
      return 'admin';
    case 'Business':
      return 'business';
    case 'Influencer':
      return 'influencer';
    case 'Staff':
      return 'staff';
    case 'User':
      return 'user';
    default:
      return normalizeRole(role);
  }
};

export const roleMatches = (role: string | undefined, matchRole: UserRole): boolean => {
  return normalizeRole(role) === matchRole;
};

export const compareRoles = (role1: string | undefined, role2: string | undefined): boolean => {
  return normalizeRole(role1) === normalizeRole(role2);
};

export const normalizeLegacyRole = (role: string | undefined | null): UserRole => {
  if (!role) return 'user';
  
  const roleToConvert = role.toString();
  return convertCapitalizedRole(roleToConvert);
};

export const isRoleEqual = (role1: string | undefined | null, role2: string | undefined | null): boolean => {
  return normalizeLegacyRole(role1) === normalizeLegacyRole(role2);
};

export const isUserRole = (role: string | undefined | null, targetRole: string): boolean => {
  if (!role || !targetRole) return false;
  return role.toLowerCase() === targetRole.toLowerCase();
};

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
  
  employeeCode?: string;
  employee_code?: string;
  city?: string;
  country?: string;
  verified?: boolean;
  website?: string;
  
  instagramHandle?: string;
  instagram_handle?: string;
  facebookHandle?: string;
  facebook_handle?: string;
  
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
  } | string;
  
  niche?: string;
  followersCount?: string;
  followers_count?: string;
  bio?: string;
  
  businessName?: string;
  business_name?: string;
  ownerName?: string;
  owner_name?: string;
  businessCategory?: string;
  business_category?: string;
  gstNumber?: string;
  gst_number?: string;
  
  subscription?: string | Record<string, any>;
  subscription_id?: string;
  subscriptionId?: string;
  subscription_status?: string;
  subscriptionStatus?: string;
  subscription_package?: string;
  subscriptionPackage?: string;
  custom_dashboard_sections?: string[];
  customDashboardSections?: string[];
  
  fullName?: string;
  userMetadata?: Record<string, any>;
}

export interface AuthContextType {
  user: User | null;
  currentUser?: User | null;
  isAuthenticated: boolean;
  isLoading?: boolean;
  loading?: boolean;
  initialized?: boolean;
  error: Error | null;
  login: (email: string, password: string, employeeCode?: string) => Promise<User | null>;
  loginWithGoogle?: () => Promise<User | null>;
  signup: (email: string, password: string, userData?: Partial<User>) => Promise<User | null>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<boolean>;
  updateUserProfile: (data: Partial<User>) => Promise<User | null>;
  refreshUserData?: () => Promise<void>;
}

export interface UserSubscription {
  id: string;
  userId?: string;
  packageId?: string;
  packageName?: string;
  status: SubscriptionStatus;
  startDate: string;
  endDate: string;
  price?: number;
  amount?: number;
  paymentType?: string;
  paymentMethod?: string;
  cancelledAt?: string;
  cancelReason?: string;
}

export type SubscriptionStatus = 'active' | 'expired' | 'cancelled' | 'pending';

export function isUserSubscription(obj: any): obj is UserSubscription {
  return (
    obj &&
    typeof obj === 'object' &&
    'id' in obj &&
    'status' in obj
  );
}

export interface SessionData {
  user: User | null;
  isAuthenticated: boolean;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: string;
  providerToken?: string | null;
}
