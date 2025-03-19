
import { User as FirebaseUser } from 'firebase/auth';

// User roles enum for type safety
export type UserRole = 'Admin' | 'Business' | 'Influencer' | 'User' | 'staff' | null;

// Extended User interface
export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isAdmin: boolean;
  role: UserRole;
  employeeCode?: string | null;
  createdAt?: string;
}

// Auth context type for the context provider
export interface AuthContextType {
  user: User | null;
  currentUser: User | null; // Alias for user for compatibility
  isAuthenticated: boolean;
  loading: boolean;
  initialized: boolean;
  userRole: UserRole;
  isAdmin: boolean;
  
  // Auth methods
  login: (email: string, password: string, employeeCode?: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  signup: (
    email: string, 
    password: string, 
    name: string, 
    role: UserRole, 
    additionalData?: any
  ) => Promise<void>;
  
  // Optional properties for role management (may be implemented)
  updateUserRole?: (user: User, role: UserRole) => Promise<User>;
  updateUserPermission?: (userId: string, isAdmin: boolean) => Promise<{userId: string, isAdmin: boolean}>;
}
