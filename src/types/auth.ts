
import { ReactNode } from 'react';

export type UserRole = 'Admin' | 'Business' | 'Influencer' | 'User' | 'Staff';

export interface User {
  id: string;
  email?: string;
  name?: string;
  fullName?: string;
  phone?: string;
  role?: UserRole | UserRole[];
  isAdmin?: boolean;
  [key: string]: any;
}

export interface AuthContextType {
  user: User | null;
  currentUser?: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  initialized?: boolean;
  error: any;
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<any>;
  signUp: (email: string, password: string, data?: any) => Promise<any>;
  resetPassword: (email: string) => Promise<any>;
  updateUser: (data: Partial<User>) => Promise<any>;
  refreshUser: () => Promise<any>;
  refreshUserData?: () => Promise<any>;
  login?: (email: string, password: string, employeeCode?: string) => Promise<any>;
  logout?: () => Promise<any>;
  loginWithGoogle?: () => Promise<any>;
  signup?: (email: string, password: string, name: string, role: UserRole, additionalData?: any) => Promise<any>;
}

export interface ProtectedRouteProps {
  children: ReactNode;
  roles?: UserRole[];
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
  paymentType?: 'recurring' | 'one-time';
  packageDetails?: any;
  cancelledAt?: string | Date;
  cancelReason?: string;
}

export type SubscriptionStatus = 'active' | 'inactive' | 'cancelled' | 'pending' | 'paused' | 'expired' | 'trial';
export type PaymentType = 'recurring' | 'one-time';

export function isUserSubscription(value: any): value is UserSubscription {
  return (
    typeof value === 'object' &&
    value !== null &&
    'packageId' in value &&
    'startDate' in value &&
    'endDate' in value
  );
}

// Helper function to handle role comparison safely
export function hasRole(user: User | null, roleToCheck: UserRole): boolean {
  if (!user || !user.role) return false;
  
  if (Array.isArray(user.role)) {
    return user.role.includes(roleToCheck);
  }
  
  return user.role === roleToCheck;
}

// Helper function to get role as string for display
export function getRoleAsString(role: UserRole | UserRole[] | undefined): string {
  if (!role) return '';
  
  if (Array.isArray(role)) {
    return role.join(', ');
  }
  
  return role;
}

// Get a single role for functions requiring a single UserRole value
export function getPrimaryRole(role: UserRole | UserRole[] | undefined): UserRole {
  if (!role) return 'User';
  
  if (Array.isArray(role)) {
    return role[0] || 'User';
  }
  
  return role;
}

// Helper function to convert role to string for lowercase comparison
export function getRoleForComparison(role: UserRole | UserRole[] | undefined): string {
  const roleString = getRoleAsString(role);
  return roleString.toLowerCase();
}
