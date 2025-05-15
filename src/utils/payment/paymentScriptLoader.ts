
import { toast as toastFunction } from '@/hooks/use-toast';
import { RAZORPAY_KEY_ID } from '../razorpayLoader';

/**
 * Load the Razorpay payment script
 */
export const loadPaymentScript = async (toast?: any): Promise<boolean> => {
  return new Promise((resolve) => {
    if ((window as any).Razorpay) {
      console.log('Razorpay already loaded');
      
      // Add hook into Razorpay for refund prevention
      try {
        const originalRazorpay = (window as any).Razorpay;
        (window as any).Razorpay = function(...args: any[]) {
          const instance = new originalRazorpay(...args);
          
          // Add intercept for automatic refund prevention
          const originalOpen = instance.open;
          instance.open = function() {
            console.log('Opening Razorpay with refund prevention enabled');
            
            // Add or strengthen anti-refund flags
            if (args[0] && args[0].notes) {
              args[0].notes.isNonRefundable = "true";
              args[0].notes.autoRefund = "false";
              args[0].notes.refundStatus = "no_refund_allowed";
              args[0].notes.refundPolicy = "no_refunds";
              args[0].notes.refundsDisabled = "true";
            }
            
            return originalOpen.apply(this, arguments);
          };
          
          return instance;
        };
        
        // Copy all properties from the original constructor
        for (const key in originalRazorpay) {
          if (Object.prototype.hasOwnProperty.call(originalRazorpay, key)) {
            (window as any).Razorpay[key] = originalRazorpay[key];
          }
        }
      } catch(err) {
        console.error('Failed to hook into Razorpay for refund prevention:', err);
        // Continue anyway, this is just an extra safeguard
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
      
      // Add hook into Razorpay for refund prevention
      try {
        const originalRazorpay = (window as any).Razorpay;
        (window as any).Razorpay = function(...args: any[]) {
          const instance = new originalRazorpay(...args);
          
          // Add intercept for automatic refund prevention
          const originalOpen = instance.open;
          instance.open = function() {
            console.log('Opening Razorpay with refund prevention enabled');
            
            // Add or strengthen anti-refund flags
            if (args[0] && args[0].notes) {
              args[0].notes.isNonRefundable = "true";
              args[0].notes.autoRefund = "false";
              args[0].notes.refundStatus = "no_refund_allowed";
              args[0].notes.refundPolicy = "no_refunds";
              args[0].notes.refundsDisabled = "true";
            }
            
            return originalOpen.apply(this, arguments);
          };
          
          return instance;
        };
        
        // Copy all properties from the original constructor
        for (const key in originalRazorpay) {
          if (Object.prototype.hasOwnProperty.call(originalRazorpay, key)) {
            (window as any).Razorpay[key] = originalRazorpay[key];
          }
        }
      } catch(err) {
        console.error('Failed to hook into Razorpay for refund prevention:', err);
        // Continue anyway, this is just an extra safeguard
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
