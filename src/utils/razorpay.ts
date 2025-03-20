
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
  recurring?: boolean;
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
  // Add specific recurring payment properties
  subscription_card_change?: boolean;
  recurring?: boolean;
  subscription_payment_capture?: boolean;
  payment_capture?: boolean;
  auth_type?: string;
  customer_id?: string;
  save?: boolean;
  config?: {
    display?: {
      language?: string;
      hide_topbar?: boolean;
    };
  };
}

// Type for Razorpay subscription request
export interface RazorpaySubscriptionRequest {
  plan_id: string;
  total_count: number;
  quantity: number;
  customer_notify?: number;
  notes?: Record<string, string>;
}

// Define Razorpay window interface
declare global {
  interface Window {
    Razorpay: any;
  }
}

// Production Razorpay API key
// This is a public key, safe to be in the codebase
export const RAZORPAY_KEY_ID = "rzp_live_8PGS0Ug3QeCb2I";

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
 * Generate a Razorpay compatible receipt ID
 * @returns A unique receipt ID
 */
export const generateReceiptId = (): string => {
  return `rcpt_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
};

/**
 * Generate a Razorpay compatible order ID - must match exact format
 * Format: order_<14-character alphanumeric ID>
 */
export const generateOrderId = (): string => {
  // We'll create a 14-character alphanumeric string
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 14; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  // The underscore after "order" is critical - must be exactly as: order_XXXXXXXXXX...
  const orderId = `order_${result}`;
  console.log("Generated Razorpay order ID:", orderId);
  return orderId;
};

/**
 * Convert amount to paise (smallest currency unit for INR)
 * Ensures minimum payment is ₹1 (100 paise)
 */
export const convertToPaise = (amount: number): number => {
  // Ensure minimum amount is 1 rupee (100 paise)
  // Round to ensure we have whole number of paise
  const paise = Math.max(Math.round(amount * 100), 100);
  console.log(`Converting amount ${amount} to ${paise} paise`);
  return paise;
};

/**
 * Ensure all values in the notes object are strings
 * Razorpay requires all notes values to be strings
 */
export const formatNotesForRazorpay = (notes?: Record<string, any>): Record<string, string> => {
  if (!notes) return {};
  
  const formattedNotes: Record<string, string> = {};
  Object.entries(notes).forEach(([key, value]) => {
    // Convert all values to strings (important for numbers, booleans, etc.)
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
  
  // Format options correctly
  const formattedOptions = {
    ...options,
    key: options.key || RAZORPAY_KEY_ID,
    notes: notesWithStringValues,
    // Ensure amount is a number (not a string)
    amount: typeof options.amount === 'string' ? parseInt(options.amount) : options.amount,
    // Add these settings for better error handling
    retry: {
      enabled: true,
      max_count: 3
    },
    // Add these to help with auto payments for subscriptions
    remember_customer: options.recurring === true ? true : false,
    send_sms_hash: true,
    readonly: {
      email: false,
      contact: false
    },
    // Add this to prevent backdrop closing issues
    modal: {
      ...options.modal,
      backdropclose: false,
      escape: false
    },
    // Add recurring payment configurations for subscriptions
    ...(options.recurring ? {
      subscription_card_change: false,
      subscription_payment_capture: true,
      payment_capture: true,
      auth_type: "netbanking",
      save: true,
      config: {
        display: {
          language: "en",
          hide_topbar: false
        }
      }
    } : {})
  };
  
  console.log("Creating Razorpay checkout with options:", formattedOptions);
  
  try {
    // Create Razorpay instance
    const razorpay = new window.Razorpay(formattedOptions);
    
    // Add error handler
    razorpay.on('payment.error', function(error: any) {
      console.error("Payment error:", error);
    });
    
    return razorpay;
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
