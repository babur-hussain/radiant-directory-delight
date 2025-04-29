
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
