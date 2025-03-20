
/**
 * Utility functions for Razorpay integration
 */

// Type for Razorpay payment response
export interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
  razorpay_subscription_id?: string;
}

// Type for Razorpay error response
export interface RazorpayError {
  code: string;
  description: string;
  source: string;
  step: string;
  reason: string;
  metadata: {
    payment_id?: string;
    order_id?: string;
  };
}

// Type for Razorpay payment options
export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  image?: string;
  order_id?: string;
  subscription_id?: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme?: {
    color?: string;
  };
  handler?: (response: RazorpayResponse) => void;
  modal?: {
    escape?: boolean;
    backdropclose?: boolean;
    ondismiss?: () => void;
  };
  retry?: {
    enabled?: boolean;
    max_count?: number;
  };
  recurring?: boolean;
  send_sms_hash?: boolean;
  remember_customer?: boolean;
  readonly?: {
    email?: boolean;
    contact?: boolean;
  };
}

// Define Razorpay window interface
declare global {
  interface Window {
    Razorpay: any;
  }
}

// Razorpay API key - using live key
const RAZORPAY_KEY_ID = "rzp_live_8PGS0Ug3QeCb2I";

/**
 * Get the Razorpay key
 */
export const getRazorpayKey = (): string => {
  return RAZORPAY_KEY_ID;
};

/**
 * Load the Razorpay script
 * @returns A promise that resolves when the script is loaded
 */
export const loadRazorpayScript = (): Promise<void> => {
  console.log("Starting to load Razorpay script");
  return new Promise((resolve, reject) => {
    // Check if script already exists
    const existingScript = document.getElementById('razorpay-checkout-js');
    
    if (existingScript) {
      console.log("Razorpay script already exists, using it");
      // Check if Razorpay is available in window
      if (typeof window !== 'undefined' && window.Razorpay) {
        console.log("Razorpay object is available in window");
        resolve();
      } else {
        // If script exists but Razorpay is not available, wait a bit
        console.log("Script exists but Razorpay object not available yet, waiting...");
        const checkRazorpay = () => {
          if (typeof window !== 'undefined' && window.Razorpay) {
            console.log("Razorpay object is now available");
            resolve();
          } else {
            console.log("Waiting for Razorpay to initialize...");
            setTimeout(checkRazorpay, 500);
          }
        };
        
        setTimeout(checkRazorpay, 500);
      }
      return;
    }
    
    // Create and append the script
    const script = document.createElement('script');
    script.id = 'razorpay-checkout-js';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      console.log("Razorpay script loaded successfully");
      // Wait to ensure Razorpay object is initialized
      const checkRazorpay = () => {
        if (typeof window !== 'undefined' && window.Razorpay) {
          console.log("Razorpay object available after script load");
          resolve();
        } else {
          console.log("Waiting for Razorpay to initialize after script load...");
          setTimeout(checkRazorpay, 500);
        }
      };
      
      setTimeout(checkRazorpay, 500);
    };
    
    script.onerror = (error) => {
      console.error("Failed to load Razorpay script:", error);
      reject(new Error("Failed to load Razorpay SDK"));
    };
    
    document.body.appendChild(script);
  });
};

/**
 * Validates if Razorpay is available in the window object
 */
export const isRazorpayAvailable = (): boolean => {
  const available = typeof window !== 'undefined' && window.Razorpay !== undefined;
  console.log("Razorpay available in window:", available);
  return available;
};

/**
 * Generate a receipt ID for Razorpay
 */
export const generateReceiptId = (): string => {
  return `rcpt_${Date.now().toString(36)}`;
};

/**
 * Convert amount to paise (smallest currency unit for INR)
 * Ensures minimum payment is ₹1 (100 paise)
 */
export const convertToPaise = (amount: number): number => {
  const paise = Math.max(Math.round(amount * 100), 100);
  console.log(`Converting amount ${amount} to ${paise} paise`);
  return paise;
};

/**
 * Format notes object for Razorpay
 * Razorpay requires all notes values to be strings
 */
export const formatNotesForRazorpay = (notes?: Record<string, any>): Record<string, string> => {
  if (!notes) return {};
  
  const formattedNotes: Record<string, string> = {};
  
  Object.entries(notes).forEach(([key, value]) => {
    // Convert all values to strings
    formattedNotes[key] = String(value);
  });
  
  return formattedNotes;
};

/**
 * Create and open Razorpay checkout
 * @param options Razorpay payment options
 * @returns Razorpay instance
 */
export const createRazorpayCheckout = (options: RazorpayOptions): any => {
  if (!isRazorpayAvailable()) {
    throw new Error("Razorpay is not available. Please refresh the page.");
  }
  
  // Ensure all numeric values in notes are converted to strings
  const notesWithStringValues = formatNotesForRazorpay(options.notes);
  
  // Simplified options to match Razorpay expectations
  const formattedOptions = {
    key: options.key || getRazorpayKey(),
    amount: options.amount,
    currency: options.currency || 'INR',
    name: options.name,
    description: options.description,
    image: options.image,
    prefill: options.prefill || {},
    notes: notesWithStringValues,
    theme: options.theme || { color: '#3399cc' },
    handler: options.handler,
    modal: {
      escape: false,
      backdropclose: false,
      ondismiss: options.modal?.ondismiss
    },
    retry: {
      enabled: false
    },
    remember_customer: true,
    // Add subscription_id for recurring payments
    subscription_id: options.subscription_id,
    // Support for recurring flag
    recurring: options.recurring
  };
  
  console.log("Creating Razorpay checkout with options:", formattedOptions);
  
  try {
    // Create and return Razorpay instance
    return new window.Razorpay(formattedOptions);
  } catch (error) {
    console.error("Error creating Razorpay instance:", error);
    throw new Error("Failed to initialize payment gateway. Please try again.");
  }
};

/**
 * Generate a simplified recurring plan ID for reference
 */
export const generatePlanId = (): string => {
  return `plan_${Date.now().toString(36)}`;
};

/**
 * Verify Razorpay payment 
 * In production, this would be done on the server side
 */
export const verifyRazorpayPayment = async (paymentData: RazorpayResponse): Promise<boolean> => {
  console.log("Verifying payment:", paymentData);
  
  // In a real implementation, this should call your backend API for verification
  // using a secure cryptographic signature check
  // For demo purposes, we're just returning true
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return true;
};

/**
 * Determine if recurring payment is available for a package
 */
export const isRecurringPaymentEligible = (paymentType: string, billingCycle?: string): boolean => {
  // Only enable recurring for packages marked as recurring with a billing cycle
  return paymentType === "recurring" && !!billingCycle;
};

/**
 * Format a date for subscription display
 */
export const formatSubscriptionDate = (date: Date): string => {
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

/**
 * Calculate the next billing date based on the billing cycle
 */
export const calculateNextBillingDate = (billingCycle: string = 'monthly', advanceMonths: number = 0): Date => {
  const nextDate = new Date();
  
  // Add advance payment months first
  if (advanceMonths > 0) {
    nextDate.setMonth(nextDate.getMonth() + advanceMonths);
  }
  
  // Then add billing cycle
  if (billingCycle === 'yearly') {
    nextDate.setFullYear(nextDate.getFullYear() + 1);
  } else {
    // Default to monthly
    nextDate.setMonth(nextDate.getMonth() + 1);
  }
  
  return nextDate;
};
