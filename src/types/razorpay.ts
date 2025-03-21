export interface RazorpayOptions {
  key: string;
  amount?: number;
  currency?: string;
  name: string;
  description?: string;
  image?: string;
  order_id?: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme?: {
    color?: string;
  };
  subscription_id?: string;
  recurring?: boolean;
  remember_customer?: boolean;
  modal?: {
    escape?: boolean;
    backdropclose?: boolean;
    ondismiss?: () => void;
  };
  callback_url?: string;
  redirect?: boolean;
  recurring_token?: {
    max_amount: number;
    expire_by: number;
  };
  [key: string]: any;
}

export interface RazorpayResponse {
  razorpay_payment_id?: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
  [key: string]: any;
}

export interface SubscriptionResult {
  order?: {
    id: string;
    entity: string;
    amount: number;
    amount_paid: number;
    amount_due: number;
    currency: string;
    receipt: string;
    status: string;
    attempts: number;
    notes: Record<string, string>;
    created_at: number;
  };
  subscription?: {
    id: string;
    entity: string;
    plan_id: string;
    customer_id: string;
    status: string;
    current_start: number;
    current_end: number;
    ended_at: number | null;
    quantity: number;
    notes: Record<string, string>;
  };
  isOneTime: boolean;
  isSubscription: boolean;
  enableAutoPay: boolean;
  amount?: number; // Payment amount in paise
  key?: string;
  currency?: string;
  setupFee?: number;
  advanceMonths?: number;
  nextBillingDate?: string;
  totalPackageMonths?: number; // Total package duration in months
  remainingAmount?: number; // Amount to be paid after initial payment
  totalAmount?: number; // Total package value
  recurringPaymentAmount?: number; // Amount for each recurring payment
  recurringPaymentCount?: number; // Number of recurring payments
  autopayDetails?: AutopayDetails; // Add autopay details
}

// New interface for autopay details
export interface AutopayDetails {
  enabled: boolean;
  nextBillingDate?: string;
  recurringAmount?: number;
  remainingPayments?: number;
  totalRemainingAmount?: number;
}

// Extended payment response with autopay information
export interface EnhancedPaymentResponse extends RazorpayResponse {
  isRecurring?: boolean;
  enableAutoPay?: boolean;
  billingCycle?: string;
  initialPayment?: number;
  recurringAmount?: number;
  totalPackageValue?: number;
  remainingAmount?: number;
  recurringPaymentCount?: number;
  packageDuration?: number;
  nextBillingDate?: string;
  packageEndDate?: string;
  autopayDetails?: AutopayDetails;
}
