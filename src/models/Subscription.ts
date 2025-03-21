
export type PaymentType = 'recurring' | 'one-time';
export type BillingCycle = 'monthly' | 'yearly';
export type SubscriptionStatus = 'active' | 'paused' | 'pending' | 'cancelled' | 'expired' | 'inactive';

export interface ISubscription {
  id: string;
  userId: string;
  packageId: string;
  packageName: string;
  status: SubscriptionStatus;
  startDate: string;
  endDate: string;
  amount: number;
  paymentType: PaymentType;
  paymentMethod?: string;
  transactionId?: string;
  billingCycle?: BillingCycle;
  signupFee?: number;
  recurring?: boolean;
  cancelledAt?: string;
  cancelReason?: string;
  createdAt?: string;
  updatedAt?: string;
  razorpaySubscriptionId?: string;
  razorpayOrderId?: string;
  recurringAmount?: number;
  nextBillingDate?: string;
  actualStartDate?: string;
  dashboardFeatures?: string[];
  dashboardSections?: string[];
  advancePaymentMonths?: number;
  [key: string]: any;
}

// Make this interface compatible with the one in SubscriptionPackage.ts
export interface ISubscriptionPackage {
  id: string;
  title: string;
  price: number;
  durationMonths: number; // Make required to match the other interface
  shortDescription?: string;
  fullDescription?: string;
  features: string[]; // Make required to match the other interface
  popular?: boolean;
  setupFee?: number;
  type?: 'Business' | 'Influencer'; // Ensure this is a union type
  paymentType?: PaymentType;
  billingCycle?: BillingCycle;
  dashboardSections?: string[];
  termsAndConditions?: string;
  advancePaymentMonths?: number;
  monthlyPrice?: number;
  isActive?: boolean;
  maxBusinesses?: number;
  maxInfluencers?: number;
  createdAt?: string;
  updatedAt?: string;
}
