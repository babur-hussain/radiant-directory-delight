
// Define types for our auth context
export type UserRole = "Business" | "Influencer" | "Admin" | "User" | "admin" | "staff" | null;

export interface Subscription {
  id: string;
  userId: string;
  packageId: string;
  packageName: string;
  amount: number;
  startDate: Date;
  endDate: Date;
  status: string;
  // New fields for Razorpay integration
  advancePaymentMonths?: number;
  signupFee?: number;
  actualStartDate?: Date | string;
  isPaused?: boolean;
  isPausable?: boolean;
  isUserCancellable?: boolean;
  invoiceIds?: string[];
  pausedAt?: Date | string;
  resumedAt?: Date | string;
}

export interface User {
  id: string;
  email: string | null;
  name: string | null;
  role: UserRole;
  photoURL?: string | null;
  isAdmin?: boolean;
  subscription?: Subscription | null;
  createdAt?: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  signup: (email: string, password: string, name: string, role: UserRole) => Promise<any>;
  logout: () => Promise<void>;
  updateUserRole: (role: UserRole) => Promise<void>;
  updateUserPermission: (userId: string, isAdmin: boolean) => Promise<void>;
  loading: boolean;
  initialized: boolean;
}
