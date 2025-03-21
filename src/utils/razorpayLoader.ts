
import { loadRazorpayScript, isRazorpayAvailable } from '@/utils/razorpay';

// Production live key
export const RAZORPAY_KEY_ID = 'rzp_live_8PGS0Ug3QeCb2I';

/**
 * Ensure Razorpay script is loaded and available
 * @returns Promise<boolean> - Returns true if Razorpay is available, false otherwise
 */
export const ensureRazorpayAvailable = async (): Promise<boolean> => {
  try {
    // First check if already loaded
    if (isRazorpayAvailable()) {
      console.log('Razorpay script already loaded');
      return true;
    }
    
    // Not loaded yet, try loading
    console.log('Attempting to load Razorpay script');
    const result = await loadRazorpayScript();
    
    if (result) {
      console.log('Razorpay script successfully loaded');
    } else {
      console.error('Failed to load Razorpay script');
    }
    
    return result;
  } catch (error) {
    console.error('Error while loading Razorpay:', error);
    return false;
  }
};
