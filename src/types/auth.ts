
// Define types for our auth context
export type UserRole = "Business" | "Influencer" | "Admin" | "User" | "admin" | "staff" | null;

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role?: UserRole;
  isAdmin?: boolean;
}

export interface Subscription {
  id: string;
  userId: string;
  packageId: string;
  packageName: string;
  amount: number;
  startDate: Date | string;
  endDate: Date | string;
  status: string;
  // New fields for Razorpay integration - making all optional for backward compatibility
  advancePaymentMonths?: number;
  signupFee?: number;
  actualStartDate?: Date | string;
  isPaused?: boolean;
  isPausable?: boolean;
  isUserCancellable?: boolean;
  invoiceIds?: string[];
  pausedAt?: Date | string;
  resumedAt?: Date | string;
  paymentType?: "recurring" | "one-time";
}

export interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  userRole: UserRole | null;
  isAdmin: boolean;
  logout: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle?: () => Promise<void>;
  signup?: (email: string, password: string, name: string, role: UserRole) => Promise<any>;
  updateUserRole?: (role: UserRole) => Promise<void>;
  updateUserPermission?: (userId: string, isAdmin: boolean) => Promise<void>;
  isAuthenticated?: boolean;
  initialized?: boolean;
  user?: User | null;
}
