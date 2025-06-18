// PhonePe configuration for production
export const PHONEPE_MERCHANT_ID = 'SU2506172305345029940130';
export const PHONEPE_CLIENT_SECRET = 'f50c1d91-57d7-4fb1-9364-ee8e6ec5b609';
export const PHONEPE_ENVIRONMENT = 'PRODUCTION' as 'UAT' | 'PRODUCTION';

/**
 * Load the PhonePe payment script - for production we use redirect method
 */
export const loadPhonePeScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    console.log('PhonePe production mode - using redirect method');
    resolve(true);
  });
};

/**
 * Check if PhonePe payment gateway is available
 */
export const isPhonePeAvailable = (): boolean => {
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

/**
 * Get PhonePe client secret
 */
export const getPhonePeClientSecret = (): string => {
  return PHONEPE_CLIENT_SECRET;
};
