
// Define Razorpay key - Use live key for production
export const RAZORPAY_KEY_ID = 'rzp_live_8PGS0Ug3QeCb2I';

/**
 * Load the Razorpay script dynamically
 */
export const loadRazorpayScript = (): Promise<boolean> => {
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
      console.error('Failed to load Razorpay script');
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

/**
 * Ensure Razorpay is available by loading it if needed
 */
export const ensureRazorpayAvailable = async (): Promise<boolean> => {
  // Check if Razorpay is already available in window
  if ((window as any).Razorpay) {
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
