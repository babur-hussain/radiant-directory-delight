
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
  return typeof window !== 'undefined' && typeof (window as any).Razorpay !== 'undefined';
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
    
    // First, remove any existing Razorpay script tags to prevent conflicts
    const existingScripts = document.querySelectorAll(`script[src*="checkout.razorpay.com"]`);
    existingScripts.forEach(script => {
      console.log("Removing existing Razorpay script");
      script.remove();
    });

    // Create and append script tag
    const script = document.createElement('script');
    script.src = RAZORPAY_SCRIPT_URL;
    script.async = true;
    script.defer = true;
    
    // Setup event handlers
    script.onload = () => {
      console.log("Razorpay script loaded successfully");
      // Add a small delay to ensure Razorpay is fully initialized
      setTimeout(() => {
        if (isRazorpayAvailable()) {
          resolve(true);
        } else {
          console.error("Razorpay failed to initialize properly");
          resolve(false);
        }
      }, 500);
    };
    
    script.onerror = () => {
      console.error("Failed to load Razorpay script");
      // Remove the failed script
      script.remove();
      resolve(false);
    };
    
    // Append to body
    document.body.appendChild(script);
    
    // Set a timeout as a fallback
    setTimeout(() => {
      if (!isRazorpayAvailable()) {
        console.error("Razorpay script load timed out");
        resolve(false);
      }
    }, 10000); // 10 second timeout
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
  
  // Try loading the script up to 3 times
  for (let attempt = 1; attempt <= 3; attempt++) {
    console.log(`Loading Razorpay script attempt ${attempt}/3`);
    const success = await loadRazorpayScript();
    if (success && isRazorpayAvailable()) {
      return true;
    }
    
    // Wait a bit before retrying
    if (attempt < 3) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  return false;
};

/**
 * Get the Razorpay instance from window
 * @returns Razorpay object or null if not available
 */
export const getRazorpay = (): any => {
  return isRazorpayAvailable() ? (window as any).Razorpay : null;
};
