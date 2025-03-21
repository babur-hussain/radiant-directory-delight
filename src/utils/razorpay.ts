
/**
 * Format a date for display in subscription context
 */
export const formatSubscriptionDate = (date: Date): string => {
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * Convert currency amount to paise (smallest currency unit in INR)
 * Razorpay requires amounts in paise
 */
export const convertToPaise = (amount: number): number => {
  return Math.round(amount * 100);
};

/**
 * Convert paise amount back to rupees
 */
export const convertFromPaise = (amountInPaise: number): number => {
  return amountInPaise / 100;
};

// Razorpay key - use test key for development 
const RAZORPAY_KEY_ID = 'rzp_test_mxolTiKYIDkIpn';

// Types for Razorpay integration
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
  readonly recurring?: boolean;
  remember_customer?: boolean;
  modal?: {
    escape?: boolean;
    backdropclose?: boolean;
    ondismiss?: () => void;
  };
  [key: string]: any;
}

export interface RazorpayResponse {
  razorpay_payment_id?: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
  [key: string]: any;
}

/**
 * Load Razorpay script dynamically
 */
export const loadRazorpayScript = async (): Promise<boolean> => {
  return new Promise((resolve) => {
    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.error('Failed to load Razorpay');
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

/**
 * Check if Razorpay script is available in the window object
 */
export const isRazorpayAvailable = (): boolean => {
  return typeof (window as any).Razorpay !== 'undefined';
};

/**
 * Get Razorpay Key ID
 */
export const getRazorpayKey = (): string => {
  return RAZORPAY_KEY_ID;
};

/**
 * Generate a unique receipt ID for orders
 */
export const generateReceiptId = (): string => {
  return `rcpt_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
};

/**
 * Create a Razorpay checkout instance
 */
export const createRazorpayCheckout = (options: RazorpayOptions): any => {
  if (!isRazorpayAvailable()) {
    throw new Error('Razorpay SDK not loaded');
  }
  return new (window as any).Razorpay(options);
};

/**
 * Format notes object for Razorpay
 * Razorpay only accepts string values in notes
 */
export const formatNotesForRazorpay = (notes: Record<string, any>): Record<string, string> => {
  const formattedNotes: Record<string, string> = {};
  
  Object.keys(notes).forEach(key => {
    const value = notes[key];
    if (value !== null && value !== undefined) {
      formattedNotes[key] = typeof value === 'object' 
        ? JSON.stringify(value) 
        : String(value);
    }
  });
  
  return formattedNotes;
};

/**
 * Check if the package is eligible for recurring payments
 */
export const isRecurringPaymentEligible = (
  paymentType: string | undefined,
  billingCycle: string | undefined
): boolean => {
  return paymentType === 'recurring' && 
    (billingCycle === 'monthly' || billingCycle === 'yearly');
};

/**
 * Calculate the next billing date based on billing cycle and advance months
 */
export const calculateNextBillingDate = (
  billingCycle: string = 'monthly',
  advanceMonths: number = 0
): Date => {
  const date = new Date();
  
  if (advanceMonths > 0) {
    date.setMonth(date.getMonth() + advanceMonths);
  } else if (billingCycle === 'yearly') {
    date.setFullYear(date.getFullYear() + 1);
  } else {
    // Default to monthly
    date.setMonth(date.getMonth() + 1);
  }
  
  return date;
};

/**
 * Create a subscription plan
 * Note: In production, this should be handled server-side
 */
export const createSubscriptionPlan = async (planDetails: {
  packageId: string;
  amount: number;
  currency: string;
  billingCycle: string;
  name: string;
  description: string;
  paymentType: string;
}): Promise<string> => {
  // This is a mock implementation
  // In production, you would call your Razorpay Edge Function
  console.log('Creating subscription plan:', planDetails);
  
  // Mock a plan ID
  return `plan_${Date.now()}_${planDetails.packageId}`;
};

/**
 * Create a subscription
 * Note: In production, this should be handled server-side
 */
export const createSubscription = async (
  planId: string,
  packageDetails: any,
  customerDetails: {
    name: string;
    email: string;
    contact: string;
  }
): Promise<string> => {
  // This is a mock implementation
  // In production, you would call your Razorpay Edge Function
  console.log('Creating subscription for plan:', planId, 'customer:', customerDetails);
  
  // Mock a subscription ID
  return `sub_${Date.now()}_${planId}`;
};
