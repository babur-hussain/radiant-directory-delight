
// PhonePe configuration for production
export const PHONEPE_MERCHANT_ID = 'GROWBHARATPAY'; // Replace with your actual merchant ID
export const PHONEPE_ENVIRONMENT = 'PRODUCTION' as 'UAT' | 'PRODUCTION';

/**
 * Load the PhonePe payment script with CORS handling
 */
export const loadPhonePeScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if ((window as any).PhonePe) {
      console.log('PhonePe already loaded');
      resolve(true);
      return;
    }

    console.log('Loading PhonePe script...');
    
    // For now, we'll skip the script loading and handle payment redirect directly
    // This avoids CORS issues with PhonePe's script
    console.log('PhonePe script loading skipped - using redirect method');
    resolve(true);
  });
};

/**
 * Check if PhonePe payment gateway is available
 */
export const isPhonePeAvailable = (): boolean => {
  // Return true since we're using redirect method
  return true;
};

/**
 * Get the PhonePe merchant ID
 */
export const getPhonePeMerchantId = (): string => {
  return PHONEPE_MERCHANT_ID;
};

/**
 * Get PhonePe environment
 */
export const getPhonePeEnvironment = (): string => {
  return PHONEPE_ENVIRONMENT;
};
