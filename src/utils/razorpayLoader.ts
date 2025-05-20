// Define Razorpay key - Use live key for production
export const RAZORPAY_KEY_ID = 'rzp_live_8PGS0Ug3QeCb2I';

/**
 * Load the Razorpay script dynamically
 */
export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if ((window as any).Razorpay) {
      // Even if already loaded, ensure we've enhanced it for refund prevention
      try {
        enhanceRazorpayForRefundPrevention();
      } catch(err) {
        console.error('Failed to enhance existing Razorpay for refund prevention:', err);
      }
      
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => {
      console.log('Razorpay script loaded via razorpayLoader');
      
      // Enhance Razorpay for refund prevention immediately
      enhanceRazorpayForRefundPrevention();
      
      resolve(true);
    };
    script.onerror = () => {
      console.error('Failed to load Razorpay script via razorpayLoader');
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

/**
 * Enhance Razorpay to prevent refunds
 */
function enhanceRazorpayForRefundPrevention() {
  if (!(window as any).Razorpay) return;
  
  const originalRazorpay = (window as any).Razorpay;
  
  // Only replace if it hasn't been enhanced already
  if ((window as any).RazorpayEnhanced) return;
  
  // Mark as enhanced to avoid multiple enhancements
  (window as any).RazorpayEnhanced = true;
  
  console.log('Enhancing Razorpay constructor to prevent refunds');
  
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
      
      // Check if we're approaching the 15 notes limit
      if (Object.keys(args[0].notes).length > 10) {
        console.warn('Too many notes detected (over 10), reducing to essentials only');
        
        // Keep only the essential notes
        const importantNotes: Record<string, string> = {};
        
        // Critical flags that must be preserved
        importantNotes['isNonRefundable'] = "true";
        importantNotes['refundStatus'] = "no_refund_allowed";
        importantNotes['refundPolicy'] = "no_refunds";
        importantNotes['transaction_id'] = args[0].transaction_id || `txn_${Date.now()}`;
        
        // Add core transaction details if available
        if (args[0].notes.package_id) importantNotes['package_id'] = args[0].notes.package_id;
        if (args[0].notes.packageId) importantNotes['packageId'] = args[0].notes.packageId;
        if (args[0].notes.user_id) importantNotes['user_id'] = args[0].notes.user_id;
        if (args[0].notes.userId) importantNotes['userId'] = args[0].notes.userId;
        
        // Replace notes with our streamlined version
        args[0].notes = importantNotes;
      } else {
        // Just add the critical refund prevention flags
        args[0].notes.isNonRefundable = "true";
        args[0].notes.refundStatus = "no_refund_allowed";
        args[0].notes.refundPolicy = "no_refunds";
        args[0].notes.transaction_id = args[0].transaction_id || `txn_${Date.now()}`;
      }
    }
    
    // Create the instance with our enhanced options
    const instance = new originalRazorpay(...args);
    
    // Override open method to ensure refund prevention
    const originalOpen = instance.open;
    instance.open = function() {
      console.log('Opening Razorpay with refund prevention enabled');
      
      // Final check to ensure we don't exceed notes limit
      if (args[0] && args[0].notes && Object.keys(args[0].notes).length > 15) {
        console.warn('Too many notes detected before opening Razorpay. Reducing to avoid errors.');
        
        // Create a new notes object with only essential keys
        const essentialNotes: Record<string, string> = {};
        
        // Critical flags that must be preserved
        essentialNotes['isNonRefundable'] = "true";
        essentialNotes['refundStatus'] = "no_refund_allowed";
        essentialNotes['refundPolicy'] = "no_refunds";
        essentialNotes['transaction_id'] = args[0].transaction_id || args[0].notes.transaction_id || `txn_${Date.now()}`;
        
        // Replace notes with essentials only
        args[0].notes = essentialNotes;
      }
      
      // Invoke original method
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
 * Ensure Razorpay is available by loading it if needed
 */
export const ensureRazorpayAvailable = async (): Promise<boolean> => {
  // Check if Razorpay is already available in window
  if ((window as any).Razorpay) {
    // Even if available, enhance it for refund prevention
    enhanceRazorpayForRefundPrevention();
    return true;
  }
  
  // If not, try to load it
  console.log("Loading Razorpay script...");
  return await loadRazorpayScript();
};

/**
 * Check browser compatibility with Razorpay
 */
export const checkRazorpayCompatibility = (): { compatible: boolean; reason?: string } => {
  // Basic compatibility checks
  if (typeof window === 'undefined') {
    return { compatible: false, reason: 'Window object not available' };
  }

  // Check for localStorage support (Razorpay uses it)
  try {
    const storage = window.localStorage;
    storage.setItem('razorpay_test', 'test');
    storage.removeItem('razorpay_test');
  } catch (e) {
    return { compatible: false, reason: 'localStorage not available' };
  }
  
  // Check for mobile browser issues
  const userAgent = navigator.userAgent || '';
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  
  if (isMobile) {
    // Check for known problematic mobile browsers
    if (/Instagram|FBAV|FBAN/i.test(userAgent)) {
      return { 
        compatible: false, 
        reason: 'Instagram/Facebook in-app browser detected. May have limited payment support.' 
      };
    }
    
    // Check for WebView (some Android WebViews have issues)
    if (/wv/i.test(userAgent) && /Android/i.test(userAgent)) {
      return { 
        compatible: false, 
        reason: 'Android WebView detected. Consider using Chrome or another browser.' 
      };
    }
  }
  
  // All checks passed
  return { compatible: true };
};
