
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
}

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
