
/**
 * Razorpay script loader and utilities
 */

// Constants
export const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_live_8PGS0Ug3QeCb2I"; // Default to live key
export const RAZORPAY_SCRIPT_URL = "https://checkout.razorpay.com/v1/checkout.js";

/**
 * Check if Razorpay is already loaded in the window
 */
export const isRazorpayAvailable = (): boolean => {
  return typeof (window as any).Razorpay !== 'undefined';
};

/**
 * Load the Razorpay script if it's not already loaded
 * @returns Promise that resolves to true if loading was successful
 */
export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    // If Razorpay is already loaded, resolve immediately
    if (isRazorpayAvailable()) {
      console.log("Razorpay is already loaded");
      resolve(true);
      return;
    }

    console.log("Loading Razorpay script...");
    
    // Check for existing script to avoid duplicates
    const existingScript = document.querySelector(`script[src="${RAZORPAY_SCRIPT_URL}"]`);
    if (existingScript) {
      console.log("Razorpay script tag exists but not initialized yet, waiting...");
      // Wait for existing script to load
      const checkRazorpay = setInterval(() => {
        if (isRazorpayAvailable()) {
          clearInterval(checkRazorpay);
          console.log("Razorpay initialized from existing script");
          resolve(true);
        }
      }, 100);
      return;
    }

    // Create and append script tag
    const script = document.createElement('script');
    script.src = RAZORPAY_SCRIPT_URL;
    script.async = true;
    script.defer = true;
    
    // Setup event handlers
    script.onload = () => {
      console.log("Razorpay script loaded successfully");
      resolve(true);
    };
    
    script.onerror = () => {
      console.error("Failed to load Razorpay script");
      // Remove the failed script
      document.body.removeChild(script);
      resolve(false);
    };
    
    // Append to body
    document.body.appendChild(script);
  });
};

/**
 * Ensure Razorpay is available before proceeding
 * Will load the script if needed
 */
export const ensureRazorpayAvailable = async (): Promise<boolean> => {
  if (isRazorpayAvailable()) {
    return true;
  }
  
  return await loadRazorpayScript();
};

/**
 * Get the Razorpay instance from window
 * @returns Razorpay object or null if not available
 */
export const getRazorpay = (): any => {
  return isRazorpayAvailable() ? (window as any).Razorpay : null;
};
