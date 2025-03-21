
/**
 * Utility functions for Razorpay integration
 */

// Helper function to determine if a package is eligible for recurring payments
export const isRecurringPaymentEligible = (
  paymentType: string,
  billingCycle?: string
): boolean => {
  // Only recurring packages with valid billing cycles can use recurring payments
  return paymentType === 'recurring' && !!billingCycle;
};

// Helper function to calculate the next billing date after advance payments
export const calculateNextBillingDate = (
  billingCycle?: string, 
  advanceMonths: number = 0
): Date => {
  const today = new Date();
  
  if (billingCycle === 'monthly') {
    // For monthly billing, add advance months
    today.setMonth(today.getMonth() + advanceMonths);
  } else {
    // For yearly billing, add advance years (convert months to years)
    today.setFullYear(today.getFullYear() + Math.floor(advanceMonths / 12));
    // Add the remaining months if any
    today.setMonth(today.getMonth() + (advanceMonths % 12));
  }
  
  return today;
};

// Format date for display in the UI
export const formatSubscriptionDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Calculate the total initial payment amount for a subscription
export const calculateInitialPayment = (
  isOneTime: boolean,
  setupFee: number = 0,
  recurringAmount: number = 0,
  advanceMonths: number = 0,
  billingCycle?: string,
  monthlyPrice?: number
): number => {
  if (isOneTime) {
    return recurringAmount;
  }
  
  // For recurring, calculate setup fee + advance payments
  let advancePayment = 0;
  
  if (billingCycle === 'monthly' && monthlyPrice) {
    advancePayment = monthlyPrice * advanceMonths;
  } else if (billingCycle === 'yearly') {
    // For yearly, we charge one full year in advance
    advancePayment = recurringAmount;
  }
  
  return setupFee + advancePayment;
};

// Additional Razorpay utility functions needed
export const loadRazorpayScript = async (): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => reject(new Error('Failed to load Razorpay checkout script'));
    document.body.appendChild(script);
  });
};

export const isRazorpayAvailable = (): boolean => {
  return typeof (window as any).Razorpay !== 'undefined';
};

export const getRazorpayKey = (): string => {
  // In production, this would come from environment variables
  // For now, return a placeholder value
  return process.env.RAZORPAY_KEY_ID || 'rzp_test_yourkeyhere';
};

export const generateReceiptId = (): string => {
  return `rcpt_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
};

export const convertToPaise = (amount: number): number => {
  // Convert rupees to paise (multiply by 100)
  return Math.round(amount * 100);
};

export interface RazorpayPrefill {
  name?: string;
  email?: string;
  contact?: string;
}

export interface RazorpayTheme {
  color?: string;
  backdrop_color?: string;
  image_padding?: boolean;
  image_frame?: boolean;
  hide_topbar?: boolean;
}

export interface RazorpayModal {
  backdropclose?: boolean;
  escape?: boolean;
  animation?: boolean;
  handleback?: boolean;
  confirm_close?: boolean;
  ondismiss?: () => void;
}

export interface RazorpayOptions {
  key: string;
  amount?: number;
  currency?: string;
  name: string;
  description?: string;
  image?: string;
  order_id?: string;
  prefill?: RazorpayPrefill;
  notes?: Record<string, string>;
  theme?: RazorpayTheme;
  modal?: RazorpayModal;
  subscription_id?: string;
  recurring?: boolean;
  remember_customer?: boolean;
  callback_url?: string;
  redirect?: boolean;
  customer_id?: string;
  [key: string]: any;
}

export interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
  razorpay_subscription_id?: string;
  [key: string]: any;
}

export const createRazorpayCheckout = (options: RazorpayOptions): any => {
  if (!isRazorpayAvailable()) {
    throw new Error('Razorpay is not loaded');
  }
  
  return new (window as any).Razorpay(options);
};

export const formatNotesForRazorpay = (notes: Record<string, any>): Record<string, string> => {
  const formatted: Record<string, string> = {};
  
  // Convert all values to strings for Razorpay compatibility
  Object.entries(notes).forEach(([key, value]) => {
    formatted[key] = typeof value === 'object' ? JSON.stringify(value) : String(value);
  });
  
  return formatted;
};

export const createSubscriptionPlan = async (planData: any): Promise<string> => {
  // This is a mock implementation that would typically call your backend
  console.log('Creating subscription plan with data:', planData);
  return `plan_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
};

export const createSubscription = async (
  planId: string, 
  packageData: any, 
  customerDetails: any
): Promise<string> => {
  // This is a mock implementation that would typically call your backend
  console.log('Creating subscription with plan:', planId, 'for customer:', customerDetails);
  return `sub_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
};
