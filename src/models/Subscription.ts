
export type PaymentType = 'recurring' | 'one-time';
export type BillingCycle = 'monthly' | 'yearly';

export interface ISubscription {
  id: string;
  userId: string;
  packageId: string;
  packageName: string;
  status: string;
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
  [key: string]: any;
}
