
// PhonePe configuration for production
export const PHONEPE_MERCHANT_ID = 'GROWBHARATPAY'; // Replace with your actual merchant ID
export const PHONEPE_ENVIRONMENT = 'PRODUCTION' as 'UAT' | 'PRODUCTION';

/**
 * Load the PhonePe payment script
 */
export const loadPhonePeScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if ((window as any).PhonePe) {
      console.log('PhonePe already loaded');
      resolve(true);
      return;
    }

    console.log('Loading PhonePe script...');
    const script = document.createElement('script');
    
    // Use production URL for PRODUCTION environment
    if (PHONEPE_ENVIRONMENT === 'PRODUCTION') {
      script.src = 'https://api.phonepe.com/apis/pg-sandbox/pg/v1/js/checkout.js';
    } else {
      script.src = 'https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/js/checkout.js';
    }
    
    script.async = true;
    script.crossOrigin = 'anonymous';
    
    script.onload = () => {
      console.log('PhonePe script loaded successfully');
      resolve(true);
    };
    
    script.onerror = (error) => {
      console.error('Failed to load PhonePe script:', error);
      resolve(false);
    };
    
    document.head.appendChild(script);
  });
};

/**
 * Check if PhonePe payment gateway is available
 */
export const isPhonePeAvailable = (): boolean => {
  return typeof (window as any).PhonePe !== 'undefined';
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
