
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
  amount?: number;
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

// Razorpay API key - using test key for development and live key for production
// IMPORTANT: In a production environment, test key should be used for development/testing only
const RAZORPAY_KEY_ID = "rzp_test_BuIiL04U1qgUGZ"; // Using test key to avoid production issues

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
 * Generate a standardized plan ID for Razorpay
 * 
 * MOCK IMPLEMENTATION NOTICE:
 * This is a client-side mock implementation only suitable for development/testing.
 * 
 * IMPORTANT: In a production environment, subscription plan creation should be 
 * implemented on your backend server using Razorpay's Plans API:
 * POST https://api.razorpay.com/v1/plans
 * 
 * These API calls require your Razorpay API key and secret, which should
 * never be exposed in client-side code.
 */
export const generatePlanId = (packageDetails: any): string => {
  // For non-production environments, we'll use a mock plan ID
  // In production, this should be replaced with an actual Razorpay plan ID
  // from the Razorpay dashboard or API
  const timestamp = Date.now();
  const randomSuffix = Math.floor(Math.random() * 1000);
  const billingCycle = packageDetails.billingCycle === 'monthly' ? 'mon' : 'yr';
  
  return `plan_${billingCycle}_${timestamp.toString().slice(-6)}_${randomSuffix}`;
};

/**
 * Create a subscription plan in Razorpay 
 * 
 * MOCK IMPLEMENTATION NOTICE:
 * This is a client-side mock implementation only suitable for development/testing.
 * 
 * IMPORTANT: In a production environment, subscription plan creation should be 
 * implemented on your backend server using Razorpay's Plans API:
 * POST https://api.razorpay.com/v1/plans
 * 
 * Example request (must be done server-side with API key and secret):
 * {
 *   "period": "monthly",
 *   "interval": 1,
 *   "item": {
 *     "name": "Test plan - Monthly",
 *     "amount": 69900,
 *     "currency": "INR",
 *     "description": "Description for the test plan"
 *   },
 *   "notes": {
 *     "notes_key_1": "Tea, Earl Grey, Hot",
 *     "notes_key_2": "Tea, Earl Grey… decaf."
 *   }
 * }
 */
export const createSubscriptionPlan = async (packageDetails: any): Promise<string> => {
  console.log("Creating subscription plan for package:", packageDetails);
  
  // In production, this would call your backend API to create a plan in Razorpay
  // The backend would make an authenticated call to Razorpay's API:
  // POST https://api.razorpay.com/v1/plans
  
  // For now, we'll generate a mock plan ID
  const planId = generatePlanId(packageDetails);
  
  // Simulate API call delay
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(`Created mock subscription plan with ID: ${planId}`);
      resolve(planId);
    }, 200);
  });
};

/**
 * Create a subscription in Razorpay
 * 
 * MOCK IMPLEMENTATION NOTICE:
 * This is a client-side mock implementation only suitable for development/testing.
 * 
 * IMPORTANT: In a production environment, subscription creation should be 
 * implemented on your backend server using Razorpay's Subscriptions API:
 * POST https://api.razorpay.com/v1/subscriptions
 * 
 * Example request (must be done server-side with API key and secret):
 * {
 *   "plan_id": "plan_JZp8ZgIqYN41JE",
 *   "total_count": 12,
 *   "quantity": 1,
 *   "start_at": 1658528104,
 *   "customer_notify": 1,
 *   "notes": {
 *     "notes_key_1": "Tea, Earl Grey, Hot",
 *     "notes_key_2": "Tea, Earl Grey… decaf."
 *   }
 * }
 */
export const createSubscription = async (
  planId: string, 
  packageDetails: any,
  customerDetails: any
): Promise<string> => {
  console.log("Creating subscription with plan:", planId, "for customer:", customerDetails);
  
  // In production, this would call your backend API to create a subscription in Razorpay
  // The backend would make an authenticated call to Razorpay's API:
  // POST https://api.razorpay.com/v1/subscriptions
  
  // For development/testing purposes only
  // Use a shorter format to avoid validation issues
  const subscriptionId = `sub_${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 100)}`;
  
  // Simulate API call delay
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(`Created mock subscription with ID: ${subscriptionId}`);
      resolve(subscriptionId);
    }, 300);
  });
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
  
  // Start with a base configuration
  let formattedOptions: any = {
    key: options.key || getRazorpayKey(),
    name: options.name,
    description: options.description,
    image: options.image,
    prefill: options.prefill || {},
    notes: notesWithStringValues,
    theme: options.theme || { color: '#3399cc' },
    modal: {
      escape: false,
      backdropclose: false,
      ondismiss: options.modal?.ondismiss
    },
    retry: {
      enabled: false
    },
    remember_customer: true,
  };
  
  // For one-time payments (non-subscription), include amount and currency
  if (options.amount && !options.subscription_id) {
    console.log("Using standard payment mode with amount:", options.amount);
    formattedOptions.amount = options.amount;
    formattedOptions.currency = options.currency || 'INR';
  }
  
  // For subscription payments, only include subscription_id and currency
  if (options.subscription_id) {
    console.log("Using subscription mode with ID:", options.subscription_id);
    formattedOptions.subscription_id = options.subscription_id;
    formattedOptions.currency = options.currency || 'INR';
    
    // Do NOT include amount for subscription payments
    delete formattedOptions.amount;
  }
  
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

/**
 * Determines whether to use subscription mode or fallback to one-time payment
 * Based on feature flags or environment settings
 */
export const shouldUseSubscriptionAPI = (): boolean => {
  // In development or testing, disable real subscriptions to avoid API errors
  // In production, this could check a feature flag or environment variable
  return false; // Temporarily disabled until backend implementation is complete
};
