
import { toast } from 'sonner';

/**
 * Load Razorpay payment script with more robust error handling
 */
export const loadPaymentScript = async (toastFn?: any): Promise<boolean> => {
  return new Promise((resolve) => {
    if ((window as any).Razorpay) {
      console.log("Razorpay already loaded");
      resolve(true);
      return;
    }

    console.log("Loading Razorpay script...");
    
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.crossOrigin = 'anonymous'; // Improve cross-origin loading
    
    // Set a reasonable timeout for script loading
    const timeoutId = setTimeout(() => {
      console.error("Razorpay script loading timed out");
      if (toastFn) {
        toastFn({
          title: "Payment Gateway Error",
          description: "Failed to load payment gateway. Please try again or use a different browser.",
          variant: "destructive"
        });
      } else if (toast) {
        toast("Failed to load payment gateway. Please try again.");
      }
      resolve(false);
    }, 10000); // 10 seconds timeout
    
    script.onload = () => {
      console.log("Razorpay script loaded successfully");
      clearTimeout(timeoutId);
      resolve(true);
    };
    
    script.onerror = (err) => {
      console.error("Error loading Razorpay script:", err);
      clearTimeout(timeoutId);
      if (toastFn) {
        toastFn({
          title: "Payment Gateway Error",
          description: "Failed to load payment gateway. Please check your internet connection.",
          variant: "destructive"
        });
      } else if (toast) {
        toast("Failed to load payment gateway. Please check your internet connection.");
      }
      resolve(false);
    };
    
    document.body.appendChild(script);
  });
};

// Check compatibility with Razorpay
export const checkRazorpayCompatibility = (): { compatible: boolean; reason?: string } => {
  // Check for major compatibility issues
  if (typeof window === 'undefined') {
    return { compatible: false, reason: 'Browser environment not available' };
  }
  
  // Detect old browsers
  const ua = navigator.userAgent;
  const isIE = ua.indexOf('MSIE ') > -1 || ua.indexOf('Trident/') > -1;
  if (isIE) {
    return { compatible: false, reason: 'Internet Explorer is not supported' };
  }
  
  // Detect private browsing mode (might have storage limitations)
  try {
    localStorage.setItem('test', 'test');
    localStorage.removeItem('test');
    sessionStorage.setItem('test', 'test');
    sessionStorage.removeItem('test');
  } catch (e) {
    return { 
      compatible: false, 
      reason: 'Private browsing mode may cause issues with payment processing' 
    };
  }
  
  return { compatible: true };
};

// Export Razorpay key for easy access
export const RAZORPAY_KEY_ID = 'rzp_live_8PGS0Ug3QeCb2I';
