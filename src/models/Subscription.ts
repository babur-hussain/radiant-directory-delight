
// Enum for payment types
export type PaymentType = 'recurring' | 'one-time';

// Enum for billing cycles
export type BillingCycle = 'monthly' | 'yearly' | undefined;

export interface Subscription {
  id: string;
  userId: string;
  packageId: string;
  packageName: string;
  amount: number;
  startDate: string;
  endDate: string;
  status: SubscriptionStatus;
  paymentMethod?: string;
  transactionId?: string;
  cancelledAt?: string;
  cancelReason?: string;
  paymentType: PaymentType;
  isPaused?: boolean;
  isPausable?: boolean;
  isUserCancellable?: boolean;
  createdAt?: string;
  updatedAt?: string;
  billingCycle?: BillingCycle;
  signupFee?: number;
  recurring?: boolean;
  razorpaySubscriptionId?: string;
  razorpayOrderId?: string;
  recurringAmount?: number;
  nextBillingDate?: string;
  actualStartDate?: string;
  dashboardFeatures?: string[];
  dashboardSections?: string[];
  // Add missing properties
  assignedBy?: string;
  assignedAt?: string;
  advancePaymentMonths?: number;
  invoiceIds?: string[];
}

// For backward compatibility - use this type alias instead of renaming all instances
export type ISubscription = Subscription;

export type SubscriptionStatus = 
  | 'active'
  | 'pending'
  | 'cancelled'
  | 'expired'
  | 'trial'
  | 'paused';

export const SUBSCRIPTION_STATUSES = {
  ACTIVE: 'active' as SubscriptionStatus,
  PENDING: 'pending' as SubscriptionStatus,
  CANCELLED: 'cancelled' as SubscriptionStatus,
  EXPIRED: 'expired' as SubscriptionStatus,
  TRIAL: 'trial' as SubscriptionStatus,
  PAUSED: 'paused' as SubscriptionStatus,
};

export interface UserSubscriptionParams {
  userId: string;
  packageId: string;
  packageName: string;
  amount: number;
  startDate: string;
  endDate: string;
  status?: SubscriptionStatus;
  paymentMethod?: string;
  transactionId?: string;
  paymentType?: PaymentType;
}

export interface SubscriptionUpdateParams {
  status?: SubscriptionStatus;
  endDate?: string;
  cancelledAt?: string;
  cancelReason?: string;
  isPaused?: boolean;
}

export interface SubscriptionAdminUpdateParams extends SubscriptionUpdateParams {
  packageId?: string;
  packageName?: string;
  amount?: number;
  startDate?: string;
  paymentMethod?: string;
  transactionId?: string;
  paymentType?: PaymentType;
  isPausable?: boolean;
  isUserCancellable?: boolean;
}

// Export ISubscriptionPackage for backward compatibility
export type { ISubscriptionPackage } from './SubscriptionPackage';
