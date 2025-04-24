
import { toast as sonnerToast } from 'sonner';

/**
 * Load the Razorpay script reliably across all devices
 * 
 * @param toastFn - Optional toast function to use instead of the default
 */
export const loadPaymentScript = async (toastFn?: any): Promise<boolean> => {
  try {
    // Check if already loaded
    if (typeof (window as any).Razorpay !== 'undefined') {
      console.log("Razorpay already available");
      return true;
    }
    
    console.log("Loading Razorpay script");
    
    // Remove any existing failed scripts
    const existingScripts = document.querySelectorAll('script[src*="razorpay"]');
    existingScripts.forEach(script => script.remove());
    
    // Create and load script
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.crossOrigin = "anonymous"; // Add cross-origin support
      
      script.onload = () => {
        console.log("Razorpay script loaded successfully");
        resolve(true);
      };
      
      // Add both onload and addEventListener for maximum browser compatibility
      script.addEventListener('load', () => {
        console.log("Razorpay script loaded via event listener");
      });
      
      script.onerror = () => {
        console.error("Failed to load Razorpay script");
        
        // Use provided toast function or fall back to sonner toast
        if (toastFn) {
          toastFn({
            title: "Payment Error",
            description: 'Failed to load payment gateway. Please try again later.',
            variant: "destructive"
          });
        } else {
          sonnerToast('Failed to load payment gateway. Please try again later.');
        }
        
        resolve(false);
      };
      
      // Add error event listener for older browsers
      script.addEventListener('error', () => {
        console.error("Failed to load Razorpay script via event listener");
      });
      
      // Add timeout
      setTimeout(() => {
        if (typeof (window as any).Razorpay === 'undefined') {
          console.error("Razorpay script load timeout");
          resolve(false);
        }
      }, 10000);
      
      document.head.appendChild(script);
    });
  } catch (error) {
    console.error('Error loading payment script:', error);
    return false;
  }
};
