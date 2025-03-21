
// Define types for subscription-related data
export type SubscriptionStatus = 'active' | 'pending' | 'cancelled' | 'expired' | 'trial' | 'paused';
export type PaymentType = 'recurring' | 'one-time';
export type BillingCycle = 'monthly' | 'yearly';

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
  createdAt?: string;
  updatedAt?: string;
  cancelledAt?: string;
  cancelReason?: string;
  assignedBy?: string;
  assignedAt?: string;
  
  // Fields for recurring payment structure
  paymentType: PaymentType;
  billingCycle?: BillingCycle;
  signupFee?: number;
  recurringAmount?: number;
  advancePaymentMonths?: number;
  nextBillingDate?: string;
  
  // Fields for subscription management
  isPaused?: boolean;
  isPausable?: boolean;
  isUserCancellable?: boolean;
  razorpaySubscriptionId?: string;
  razorpayOrderId?: string;
  invoiceIds?: string[];
  
  // For convenience
  dashboardFeatures?: string[];
  dashboardSections?: string[];
  actualStartDate?: string;
}

// Alias ISubscription to Subscription for backward compatibility
export type ISubscription = Subscription;

// Define the subscription package interface
export interface ISubscriptionPackage {
  id: string;
  title: string;
  shortDescription?: string;
  fullDescription?: string;
  price: number;
  monthlyPrice?: number;
  features: string[];
  popular?: boolean;
  paymentType: PaymentType;
  billingCycle?: BillingCycle;
  durationMonths?: number;
  setupFee?: number;
  advancePaymentMonths?: number;
  dashboardFeatures?: string[];
  dashboardSections?: string[];
  termsAndConditions?: string;
}
