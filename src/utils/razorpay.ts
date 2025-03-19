
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

// Razorpay API key - Using a test key
export const RAZORPAY_KEY_ID = "rzp_test_cNIFmAmiJ65uQS";

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

/**
 * Create a new Razorpay order
 * For demo purposes, this creates a client-side order
 * In production, this should call a secure backend endpoint
 */
export const createRazorpayOrder = async (amount: number, currency: string = 'INR'): Promise<any> => {
  console.log(`Creating Razorpay order for amount: ${amount} ${currency}`);
  
  // In a real implementation, this should call your backend API
  // For demo purposes, we're creating a mock order
  const orderId = generateOrderId();
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return {
    id: orderId,
    amount: convertToPaise(amount),
    currency,
    receipt: `receipt_${Date.now()}`,
    status: 'created'
  };
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
