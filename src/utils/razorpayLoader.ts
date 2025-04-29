
/**
 * Razorpay script loader utility
 */

// Production Razorpay key ID
export const RAZORPAY_KEY_ID = 'rzp_live_8PGS0Ug3QeCb2I';

/**
 * Asynchronously load the Razorpay script and ensure it's available
 * @returns Promise<boolean> - True if script loaded successfully
 */
export const ensureRazorpayAvailable = async (): Promise<boolean> => {
  return new Promise((resolve) => {
    // Check if Razorpay is already available
    if (typeof (window as any).Razorpay !== 'undefined') {
      console.log("Razorpay already loaded");
      resolve(true);
      return;
    }

    console.log("Loading Razorpay checkout script");
    
    // Remove any existing failed scripts
    const existingScripts = document.querySelectorAll('script[src*="razorpay"]');
    existingScripts.forEach(script => script.remove());
    
    // Create and inject the script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.defer = true;
    script.crossOrigin = "anonymous"; // Better cross-browser compatibility
    
    // Setup event handlers with both event types for maximum browser compatibility
    script.onload = () => {
      console.log("Razorpay script loaded successfully");
      resolve(true);
    };
    
    script.addEventListener('load', () => {
      console.log("Razorpay script loaded via event listener");
      resolve(true);
    });
    
    script.onerror = () => {
      console.error("Error loading Razorpay script");
      resolve(false);
    };
    
    script.addEventListener('error', () => {
      console.error("Error loading Razorpay script via event listener");
      resolve(false);
    });

    // Add to document
    document.head.appendChild(script);
    
    // Set timeout to prevent hanging
    setTimeout(() => {
      if (typeof (window as any).Razorpay === 'undefined') {
        console.error("Razorpay script load timed out");
        resolve(false);
      }
    }, 10000); // 10 second timeout
  });
};

/**
 * Check if current environment is compatible with Razorpay
 */
export const checkRazorpayCompatibility = (): { compatible: boolean, reason?: string } => {
  try {
    // Check for basic browser features needed by Razorpay
    if (typeof window === 'undefined') {
      return { compatible: false, reason: 'Not running in browser environment' };
    }
    
    // Check if browser supports required features
    if (!window.postMessage) {
      return { compatible: false, reason: 'Browser does not support postMessage' };
    }
    
    if (!window.localStorage) {
      return { compatible: false, reason: 'Browser does not support localStorage' };
    }
    
    // Check for mobile webview limitations
    const userAgent = navigator.userAgent || '';
    const isFacebookBrowser = userAgent.indexOf('FBAN') > -1 || userAgent.indexOf('FBAV') > -1;
    const isInstagramBrowser = userAgent.indexOf('Instagram') > -1;
    
    if (isFacebookBrowser) {
      return { compatible: false, reason: 'Facebook in-app browser has limited payment support' };
    }
    
    if (isInstagramBrowser) {
      return { compatible: false, reason: 'Instagram in-app browser has limited payment support' };
    }
    
    return { compatible: true };
  } catch (error) {
    console.error('Error checking Razorpay compatibility:', error);
    return { compatible: false, reason: 'Error checking compatibility' };
  }
};
