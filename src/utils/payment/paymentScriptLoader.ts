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
        // Access enhanceRazorpayForRefundPrevention through window to prevent TypeScript errors
        if ((window as any).enhanceRazorpayForRefundPrevention) {
          (window as any).enhanceRazorpayForRefundPrevention();
        } else {
          // This is a backup method if the function isn't available on window
          enhanceRazorpayConstructor();
        }
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
      enhanceRazorpayConstructor();
      
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
function enhanceRazorpayConstructor() {
  if (!(window as any).Razorpay) return;
  
  // Skip if already enhanced
  if ((window as any).RazorpayEnhanced) {
    console.log('Razorpay already enhanced, skipping');
    return;
  }
  
  const originalRazorpay = (window as any).Razorpay;
  
  // Mark as enhanced to prevent multiple enhancements
  (window as any).RazorpayEnhanced = true;
  
  console.log('Enhancing Razorpay to prevent refunds from paymentScriptLoader');
  
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
      
      // CRUCIAL FIX: Check total notes count before adding more
      const currentNotesCount = Object.keys(args[0].notes).length;
      console.log(`Current notes count: ${currentNotesCount}`);
      
      if (currentNotesCount > 10) {
        // We have too many notes, create a smaller set with only essential ones
        const essentialNotes: Record<string, string> = {
          isNonRefundable: "true",
          refundStatus: "no_refund_allowed",
          refundPolicy: "no_refunds",
          transaction_id: args[0].transaction_id
        };
        
        // Add key package and user details if available
        if (args[0].notes.packageId || args[0].notes.package_id) {
          essentialNotes.package_id = args[0].notes.packageId || args[0].notes.package_id;
        }
        
        if (args[0].notes.userId || args[0].notes.user_id) {
          essentialNotes.user_id = args[0].notes.userId || args[0].notes.user_id;
        }
        
        // Replace the notes with our optimized version
        args[0].notes = essentialNotes;
      } else {
        // We have room to add the essential flags
        args[0].notes.isNonRefundable = "true";
        args[0].notes.refundStatus = "no_refund_allowed";
        args[0].notes.refundPolicy = "no_refunds";
        args[0].notes.transaction_id = args[0].transaction_id;
      }
      
      // Add setup fee to notes if present and we have room
      if (args[0].setupFee && Object.keys(args[0].notes).length < 14) {
        args[0].notes.setupFee = String(args[0].setupFee);
      }
    }
    
    // Create the instance with our enhanced options
    const instance = new originalRazorpay(...args);
    
    // Override open method to ensure refund prevention
    const originalOpen = instance.open;
    instance.open = function() {
      console.log('Opening Razorpay with refund prevention enabled');
      
      // Final check before opening - crucial to prevent the 15 notes limit error
      if (args[0] && args[0].notes && Object.keys(args[0].notes).length > 15) {
        console.warn('Too many notes detected before opening Razorpay. Reducing to avoid errors.');
        
        // Create new notes object with only the most essential keys
        const limitedNotes: Record<string, string> = {
          isNonRefundable: "true",
          refundStatus: "no_refund_allowed",
          refundPolicy: "no_refunds",
          transaction_id: args[0].transaction_id
        };
        
        console.log(`Reduced notes from ${Object.keys(args[0].notes).length} to ${Object.keys(limitedNotes).length}`);
        
        // Replace notes with limited version
        args[0].notes = limitedNotes;
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
  
  // Export the enhancer function to window for reuse
  (window as any).enhanceRazorpayForRefundPrevention = enhanceRazorpayConstructor;
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
