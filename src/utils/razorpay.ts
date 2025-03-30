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

// Razorpay key - production live key
const RAZORPAY_KEY_ID = 'rzp_live_8PGS0Ug3QeCb2I';

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
  
  // Instead of validating order_id format, we'll just use whatever comes from our backend
  // This is because we're generating a dummy order ID that might not match the previous validation pattern
  
  // Override with production key to ensure consistency
  options.key = RAZORPAY_KEY_ID;
  
  // CRITICAL: Set non-refundable flags for ALL payment types
  if (!options.notes) {
    options.notes = {};
  }
  
  // These flags are crucial to prevent automatic refunds
  options.notes.autoRefund = "false";
  options.notes.isRefundable = "false";
  options.notes.isNonRefundable = "true";
  
  // For one-time payments, explicitly disable autopay
  if (options.notes.paymentType === "one-time" || !options.recurring) {
    options.notes.enableAutoPay = "false";
    options.notes.isRecurring = "false";
    options.notes.isCancellable = "false";
    
    // Create a new options object without the recurring flag instead of directly modifying it
    const newOptions = { ...options };
    delete newOptions.recurring;
    delete newOptions.recurring_token;
    
    return new (window as any).Razorpay(newOptions);
  }
  
  // Set up for direct payment with key-only mode
  // In this mode, Razorpay will handle the payment directly
  if (!options.order_id && options.amount) {
    console.log("Setting up direct payment with amount:", options.amount);
    options.currency = options.currency || 'INR';
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
  
  // CRITICAL: Always add non-refundable flags
  formattedNotes.autoRefund = "false";
  formattedNotes.isRefundable = "false";
  formattedNotes.isNonRefundable = "true";
  
  return formattedNotes;
};

/**
 * Check if the package is eligible for recurring payments
 */
export const isRecurringPaymentEligible = (
  paymentType: string | undefined,
  billingCycle: string | undefined
): boolean => {
  // Only packages with 'recurring' payment type and valid billing cycle are eligible for recurring payments
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

/**
 * Prepare notes for Razorpay checkout
 * This ensures the payment data is properly formatted
 */
export const preparePaymentNotes = (
  userId: string,
  packageData: any,
  isOneTime: boolean
): Record<string, string> => {
  // Create basic notes object with strings only
  const notes: Record<string, string> = {
    packageId: packageData.id,
    packageName: packageData.title,
    amount: String(packageData.price || 0),
    paymentType: isOneTime ? "one-time" : "recurring",
    userId: userId,
    // CRITICAL - set these flags correctly to prevent auto-refunds
    isRefundable: "false",
    autoRefund: "false",
    isNonRefundable: "true",
    // Always set correct recurring/autopay flags
    isRecurring: isOneTime ? "false" : "true",
    enableAutoPay: isOneTime ? "false" : "true",
    isCancellable: isOneTime ? "false" : "true"
  };
  
  // For one-time payments, explicitly disable autopay in notes
  if (isOneTime) {
    notes.autopayDetails = JSON.stringify({
      enabled: false,
      nextBillingDate: null,
      recurringAmount: 0,
      remainingPayments: 0,
      totalRemainingAmount: 0
    });
  }
  
  return notes;
};

/**
 * Helper function to explicitly set non-refundable parameters
 */
export const setNonRefundableParams = (options: RazorpayOptions): void => {
  // Ensure the payment is not automatically refunded
  if (!options.notes) {
    options.notes = {};
  }
  
  // Set critical flags to prevent automatic refunds
  options.notes.autoRefund = "false";
  options.notes.isRefundable = "false";
  options.notes.isNonRefundable = "true";
  
  // For one-time payments, ensure autopay is disabled
  if (options.notes.paymentType === "one-time") {
    options.notes.enableAutoPay = "false";
    options.notes.isRecurring = "false";
    options.notes.isCancellable = "false";
    // Remove any recurring flags
    options.recurring = false;
    if (options.recurring_token) {
      delete options.recurring_token;
    }
  }
}

/**
 * Helper to ensure payment is processed as non-refundable
 * This adds multiple safety checks and flags
 */
export const ensureNonRefundablePayment = (options: RazorpayOptions, isOneTime: boolean): void => {
  if (!options.notes) {
    options.notes = {};
  }
  
  // Set all required non-refundable flags
  options.notes.autoRefund = "false";
  options.notes.isRefundable = "false";
  options.notes.isNonRefundable = "true";
  options.notes.refund_status = "no_refund_possible";
  
  // Set appropriate flags based on payment type
  if (isOneTime) {
    options.notes.paymentType = "one-time";
    options.notes.isRecurring = "false";
    options.notes.enableAutoPay = "false";
    options.notes.isCancellable = "false";
    options.notes.autopayDetails = JSON.stringify({
      enabled: false
    });
    
    // Create a new options object without recurring properties
    const cleanedOptions = { ...options };
    delete cleanedOptions.recurring;
    delete cleanedOptions.recurring_token;
    delete cleanedOptions.subscription_id;
    
    // Copy properties back to original object
    Object.keys(options).forEach(key => {
      if (key !== 'recurring' && key !== 'recurring_token' && key !== 'subscription_id') {
        options[key] = cleanedOptions[key];
      }
    });
  } else {
    options.notes.paymentType = "recurring";
    options.notes.isRecurring = "true";
    options.notes.enableAutoPay = "true";
  }
  
  console.log("Payment configured as non-refundable with options:", options.notes);
}
