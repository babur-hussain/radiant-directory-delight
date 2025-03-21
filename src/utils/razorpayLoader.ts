
// Key ID for Razorpay integration - using test key for development environment
export const RAZORPAY_KEY_ID = 'rzp_test_mxolTiKYIDkIpn';

// Maximum number of load attempts
const MAX_LOAD_ATTEMPTS = 3;

// Track load attempts
let loadAttempts = 0;

/**
 * Checks if Razorpay is already loaded
 */
export const isRazorpayLoaded = (): boolean => {
  return typeof (window as any).Razorpay !== 'undefined';
};

/**
 * Loads the Razorpay script into the document
 */
export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    // If already loaded, resolve immediately
    if (isRazorpayLoaded()) {
      console.info('Razorpay already loaded');
      return resolve(true);
    }

    loadAttempts++;
    console.info(`Loading Razorpay script attempt ${loadAttempts}/${MAX_LOAD_ATTEMPTS}`);

    // Remove any existing script to avoid duplication issues
    const existingScript = document.querySelector('script[src*="checkout.razorpay.com"]');
    if (existingScript) {
      console.info('Removing existing Razorpay script');
      existingScript.remove();
      // Reset any potential Razorpay global objects
      (window as any).Razorpay = undefined;
    }

    // Create and append the script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.defer = true;
    
    // Set up load and error handlers
    script.onload = () => {
      console.info('Razorpay script loaded successfully');
      loadAttempts = 0; // Reset load attempts on success
      resolve(true);
    };
    
    script.onerror = (error) => {
      console.error('Error loading Razorpay script:', error);
      
      // If we have attempts left, try again
      if (loadAttempts < MAX_LOAD_ATTEMPTS) {
        console.info(`Retrying Razorpay script load (${loadAttempts}/${MAX_LOAD_ATTEMPTS})`);
        // Remove failed script
        script.remove();
        // Try to load again
        setTimeout(() => {
          loadRazorpayScript().then(resolve);
        }, 1000);
      } else {
        console.error(`Failed to load Razorpay after ${MAX_LOAD_ATTEMPTS} attempts`);
        resolve(false);
      }
    };
    
    // Add script to document
    document.body.appendChild(script);
  });
};

/**
 * Ensures Razorpay is available, loading it if necessary
 */
export const ensureRazorpayAvailable = async (): Promise<boolean> => {
  try {
    if (isRazorpayLoaded()) {
      return true;
    }
    return await loadRazorpayScript();
  } catch (error) {
    console.error('Error ensuring Razorpay is available:', error);
    return false;
  }
};
