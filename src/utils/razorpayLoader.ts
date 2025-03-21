
/**
 * Utility functions for loading and checking Razorpay script
 */

// Constants - using live key for production
export const RAZORPAY_KEY_ID = 'rzp_live_8PGS0Ug3QeCb2I';

/**
 * Load Razorpay script dynamically
 */
export const loadRazorpayScript = async (): Promise<boolean> => {
  return new Promise((resolve) => {
    // Check if Razorpay is already loaded
    if ((window as any).Razorpay) {
      console.log("Razorpay already loaded");
      resolve(true);
      return;
    }

    console.log("Loading Razorpay script...");
    
    // Clean up any existing script elements to avoid duplicates
    const existingScript = document.querySelector('script[src*="checkout.razorpay.com"]');
    if (existingScript) {
      console.log("Found existing Razorpay script, removing it");
      existingScript.remove();
    }
    
    // Create fresh script element
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.setAttribute('crossorigin', 'anonymous');
    
    script.onload = () => {
      console.log("Razorpay script loaded successfully");
      resolve(true);
    };
    
    script.onerror = (error) => {
      console.error('Failed to load Razorpay script:', error);
      resolve(false);
    };
    
    document.body.appendChild(script);
  });
};

/**
 * Check if Razorpay is available in the window object
 */
export const isRazorpayAvailable = (): boolean => {
  const available = typeof (window as any).Razorpay !== 'undefined';
  console.log("Razorpay available:", available);
  return available;
};

/**
 * Format a date for display in subscription details
 */
export const formatSubscriptionDate = (date: Date): string => {
  return date.toLocaleDateString('en-IN', {
    year: 'numeric', 
    month: 'long', 
    day: 'numeric'
  });
};
