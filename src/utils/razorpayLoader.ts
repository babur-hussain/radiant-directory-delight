
import { loadRazorpayScript, isRazorpayAvailable } from '@/utils/razorpay';

// Production live key
export const RAZORPAY_KEY_ID = 'rzp_live_8PGS0Ug3QeCb2I';

/**
 * Ensure Razorpay script is loaded and available
 */
export const ensureRazorpayAvailable = async (): Promise<boolean> => {
  // First check if already loaded
  if (isRazorpayAvailable()) {
    return true;
  }
  
  // Not loaded yet, try loading
  return await loadRazorpayScript();
};
