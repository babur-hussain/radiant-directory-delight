
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
  
  // New fields for advanced payment structure
  advancePaymentMonths: number;
  signupFee: number;
  actualStartDate: string; // When subscription actually starts after advance period
  isPaused: boolean;
  pausedAt?: string;
  pausedBy?: string;
  resumedAt?: string;
  resumedBy?: string;
  isPausable: boolean; // Whether admin allows this subscription to be paused
  isUserCancellable: boolean; // Whether user can cancel (defaults to false)
  invoiceIds: string[]; // Array of Razorpay invoice IDs
  razorpaySubscriptionId?: string; // Razorpay subscription ID
  
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
