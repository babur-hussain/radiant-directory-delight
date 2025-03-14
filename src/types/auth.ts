
// Define types for our auth context
export type UserRole = "Business" | "Influencer" | "Admin" | "admin" | "staff" | null;

export interface Subscription {
  id: string;
  userId: string;
  packageId: string;
  packageName: string;
  amount: number;
  startDate: Date;
  endDate: Date;
  status: string;
}

export interface User {
  id: string;
  email: string | null;
  name: string | null;
  role: UserRole;
  photoURL?: string | null;
  isAdmin?: boolean;
  subscription?: Subscription | null;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  signup: (email: string, password: string, name: string, role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  updateUserRole: (role: UserRole) => Promise<void>;
  updateUserPermission: (userId: string, isAdmin: boolean) => Promise<void>;
  loading: boolean;
  initialized: boolean;
}
