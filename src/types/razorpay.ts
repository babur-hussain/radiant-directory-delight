
/**
 * Type definitions for Razorpay integration
 */

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
  modal?: {
    ondismiss?: () => void;
    escape?: boolean;
    backdropclose?: boolean;
  };
  handler?: (response: any) => void;
  [key: string]: any;
}

export interface RazorpayInstance {
  open: () => void;
  on: (event: string, callback: (response: any) => void) => void;
  [key: string]: any;
}

export interface RazorpayResponse {
  razorpay_payment_id?: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
  razorpay_subscription_id?: string;
  [key: string]: any;
}

export interface SubscriptionResult {
  isSubscription: boolean;
  subscription?: {
    id: string;
    [key: string]: any;
  };
  order?: {
    id: string;
    amount: number;
    currency: string;
    [key: string]: any;
  };
  [key: string]: any;
}
