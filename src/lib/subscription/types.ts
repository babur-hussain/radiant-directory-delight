
import { Timestamp } from "firebase/firestore";

// Define subscription data interface
export interface SubscriptionData {
  id?: string;
  userId: string;
  packageId: string;
  packageName: string;
  amount: number;
  startDate: string;
  endDate: string;
  status: string;
  paymentMethod?: string;
  transactionId?: string;
  createdAt?: any;
  updatedAt?: any;
  cancelledAt?: string;
  cancelReason?: string;
  assignedBy?: string;
  assignedAt?: string;
  
  // New fields for advanced payment structure - making them optional for backward compatibility
  advancePaymentMonths?: number; 
  signupFee?: number;
  actualStartDate?: string;
  isPaused?: boolean;
  pausedAt?: string;
  pausedBy?: string;
  resumedAt?: string;
  resumedBy?: string;
  isPausable?: boolean;
  isUserCancellable?: boolean;
  invoiceIds?: string[];
  razorpaySubscriptionId?: string;
  paymentType?: "recurring" | "one-time"; // New field for one-time vs recurring
  
  [key: string]: any; // Allow additional properties
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  amount: number;
  currency: string;
  interval: "monthly" | "yearly";
  intervalCount: number;
  notes?: Record<string, string>;
  razorpayPlanId?: string;
}

export interface AdvancePaymentOption {
  months: number;
  label: string;
}

export const DEFAULT_ADVANCE_PAYMENT_OPTIONS: AdvancePaymentOption[] = [
  { months: 3, label: "3 months" },
  { months: 6, label: "6 months" },
  { months: 12, label: "1 year" }
];
