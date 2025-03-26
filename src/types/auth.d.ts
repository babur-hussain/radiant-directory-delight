import { User } from 'firebase/auth';

export interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<any>;
  loginWithGoogle: () => Promise<any>;
  logout: () => Promise<void>;
  register: (email: string, password: string, userData: any) => Promise<any>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (data: any) => Promise<void>;
}

export interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  adminOnly?: boolean;
}
