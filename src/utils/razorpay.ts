
/**
 * Utility functions for Razorpay integration
 */

// Type for Razorpay payment response
export interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
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

// Define Razorpay window interface
declare global {
  interface Window {
    Razorpay: any;
  }
}

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
        setTimeout(() => {
          if (typeof window !== 'undefined' && window.Razorpay) {
            console.log("Razorpay object is now available");
            resolve();
          } else {
            console.error("Razorpay not available even after waiting");
            reject(new Error("Razorpay SDK not initialized properly"));
          }
        }, 2000);
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
      setTimeout(() => {
        if (typeof window !== 'undefined' && window.Razorpay) {
          console.log("Razorpay object available after script load");
          resolve();
        } else {
          console.error("Razorpay object not available after script load");
          reject(new Error("Razorpay SDK not initialized properly"));
        }
      }, 1000);
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
 * Generate a unique order ID
 */
export const generateOrderId = (): string => {
  return `order_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
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
