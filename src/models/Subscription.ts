
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
  [key: string]: any;
}

export interface ISubscriptionPackage {
  id: string;
  title: string;
  price: number;
  shortDescription?: string;
  fullDescription?: string;
  features?: string[];
  popular?: boolean;
  setupFee?: number;
  durationMonths?: number;
  type?: 'Business' | 'Influencer';
  paymentType?: PaymentType;
  billingCycle?: BillingCycle;
  dashboardSections?: string[];
  termsAndConditions?: string;
}
