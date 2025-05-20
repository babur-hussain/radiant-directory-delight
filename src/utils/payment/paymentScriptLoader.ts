
import { toast as toastFunction } from '@/hooks/use-toast';
import { RAZORPAY_KEY_ID, enhanceRazorpayForRefundPrevention } from '../razorpayLoader';

/**
 * Load the Razorpay payment script
 */
export const loadPaymentScript = async (toast?: any): Promise<boolean> => {
  return new Promise((resolve) => {
    if ((window as any).Razorpay) {
      console.log('Razorpay already loaded');
      
      // Make sure we intercept Razorpay instance creation to prevent refunds
      try {
        // First try using the exported function directly
        enhanceRazorpayForRefundPrevention();
        
        // Also ensure the window reference is available for other components
        (window as any).enhanceRazorpayForRefundPrevention = enhanceRazorpayForRefundPrevention;
      } catch(err) {
        console.error('Failed to enhance Razorpay for refund prevention:', err);
      }
      
      resolve(true);
      return;
    }

    console.log('Loading Razorpay script...');
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    
    script.onload = () => {
      console.log('Razorpay script loaded successfully');
      
      // Enhance Razorpay to prevent refunds
      try {
        enhanceRazorpayForRefundPrevention();
        (window as any).enhanceRazorpayForRefundPrevention = enhanceRazorpayForRefundPrevention;
      } catch(err) {
        console.error('Failed to enhance Razorpay after loading:', err);
      }
      
      resolve(true);
    };
    
    script.onerror = () => {
      console.error('Failed to load Razorpay script');
      if (toast) {
        toast({
          title: "Error",
          description: "Failed to load payment gateway. Please refresh and try again.",
          variant: "destructive"
        });
      }
      resolve(false);
    };
    
    document.body.appendChild(script);
  });
};

/**
 * Check if payment gateway is available
 */
export const isPaymentGatewayAvailable = (): boolean => {
  return typeof (window as any).Razorpay !== 'undefined';
};

/**
 * Get the Razorpay key ID
 */
export const getPaymentGatewayKey = (): string => {
  return RAZORPAY_KEY_ID;
};
