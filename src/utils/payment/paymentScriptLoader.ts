import { toast as toastFunction } from '@/hooks/use-toast';
import { RAZORPAY_KEY_ID } from '../razorpayLoader';

/**
 * Load the Razorpay payment script
 */
export const loadPaymentScript = async (toast?: any): Promise<boolean> => {
  return new Promise((resolve) => {
    if ((window as any).Razorpay) {
      console.log('Razorpay already loaded');
      
      // Make sure we intercept Razorpay instance creation to prevent refunds
      try {
        enhanceRazorpayForRefundPrevention();
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
      enhanceRazorpayForRefundPrevention();
      
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
 * Enhance Razorpay constructor to prevent refunds
 */
function enhanceRazorpayForRefundPrevention() {
  if (!(window as any).Razorpay) return;
  
  const originalRazorpay = (window as any).Razorpay;
  
  // Replace the constructor with our enhanced version
  (window as any).Razorpay = function(...args: any[]) {
    // Add refund prevention flags to the options
    if (args[0] && typeof args[0] === 'object') {
      // Generate a unique transaction ID if not already present
      if (!args[0].transaction_id) {
        args[0].transaction_id = `txn_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      }
      
      // Ensure notes object exists
      if (!args[0].notes) {
        args[0].notes = {};
      }
      
      // Limit notes to essential ones only (max 15)
      const essentialKeys = [
        'packageId', 'package_id', 'user_id', 'transaction_id', 
        'isNonRefundable', 'refundStatus', 'refundPolicy'
      ];
      
      // Keep only the most important notes if we're approaching the 15 limit
      if (Object.keys(args[0].notes).length > 10) {
        const importantNotes = {};
        essentialKeys.forEach(key => {
          if (args[0].notes[key]) {
            importantNotes[key] = args[0].notes[key];
          }
        });
        
        // Add refund prevention flags
        importantNotes['isNonRefundable'] = "true";
        importantNotes['refundStatus'] = "no_refund_allowed";
        importantNotes['refundPolicy'] = "no_refunds";
        importantNotes['transaction_id'] = args[0].transaction_id || `txn_${Date.now()}`;
        
        // Replace notes with our streamlined version
        args[0].notes = importantNotes;
      } else {
        // Just add the critical refund prevention flags
        args[0].notes.isNonRefundable = "true";
        args[0].notes.refundStatus = "no_refund_allowed";
        args[0].notes.refundPolicy = "no_refunds";
        args[0].notes.transaction_id = args[0].transaction_id || `txn_${Date.now()}`;
      }
      
      // Add setup fee to notes if present
      if (args[0].setupFee && !args[0].notes.setupFee) {
        args[0].notes.setupFee = String(args[0].setupFee);
      }
    }
    
    // Create the instance with our enhanced options
    const instance = new originalRazorpay(...args);
    
    // Override open method to ensure refund prevention
    const originalOpen = instance.open;
    instance.open = function() {
      console.log('Opening Razorpay with refund prevention enabled');
      // Final check before opening
      if (args[0] && args[0].notes && Object.keys(args[0].notes).length > 15) {
        console.warn('Too many notes detected before opening Razorpay. Reducing to avoid errors.');
        // Remove least important notes until we're under 15
        const keys = Object.keys(args[0].notes);
        const keysToRemove = keys.length - 14; // Leave room for essential ones
        
        if (keysToRemove > 0) {
          // Keep the most important notes
          for (let i = 0; i < keysToRemove; i++) {
            // Don't delete essential flags
            if (!['isNonRefundable', 'refundStatus', 'transaction_id', 'refundPolicy'].includes(keys[i])) {
              delete args[0].notes[keys[i]];
            }
          }
        }
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
}

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
