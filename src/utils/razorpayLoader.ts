
/**
 * Utility functions for loading and checking Razorpay script
 */

// Constants
export const RAZORPAY_KEY_ID = 'rzp_live_8PGS0Ug3QeCb2I'; // Using live key for production

/**
 * Load Razorpay script dynamically
 */
export const loadRazorpayScript = async (): Promise<boolean> => {
  return new Promise((resolve) => {
    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.error('Failed to load Razorpay');
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

/**
 * Check if Razorpay is available in the window object
 */
export const isRazorpayAvailable = (): boolean => {
  return typeof (window as any).Razorpay !== 'undefined';
};
