
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
