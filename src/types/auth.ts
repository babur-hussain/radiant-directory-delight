
import { ReactNode } from 'react';

export type UserRole = 'Admin' | 'Business' | 'Influencer' | 'User';

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
  isAuthenticated: boolean;
  loading: boolean;
  error: any;
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<any>;
  signUp: (email: string, password: string, data?: any) => Promise<any>;
  resetPassword: (email: string) => Promise<any>;
  updateUser: (data: Partial<User>) => Promise<any>;
  refreshUser: () => Promise<any>;
}

export interface ProtectedRouteProps {
  children: ReactNode;
  roles?: UserRole[];
}
