
import { toast as toastFunction } from '@/hooks/use-toast';

// Paytm demo credentials
const PAYTM_MID = 'rxazcv89315285244163'; // Demo merchant ID
const PAYTM_ENVIRONMENT = 'TEST'; // TEST for demo, PROD for production

/**
 * Load the Paytm payment script
 */
export const loadPaymentScript = async (toast?: any): Promise<boolean> => {
  return new Promise((resolve) => {
    if ((window as any).Paytm && (window as any).Paytm.CheckoutJS) {
      console.log('Paytm already loaded');
      resolve(true);
      return;
    }

    console.log('Loading Paytm script...');
    const script = document.createElement('script');
    script.src = `https://securegw-stage.paytm.in/merchantpgpui/checkoutjs/merchants/${PAYTM_MID}.js`;
    script.async = true;
    
    script.onload = () => {
      console.log('Paytm script loaded successfully');
      resolve(true);
    };
    
    script.onerror = () => {
      console.error('Failed to load Paytm script');
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
  return typeof (window as any).Paytm !== 'undefined' && typeof (window as any).Paytm.CheckoutJS !== 'undefined';
};

/**
 * Get the Paytm merchant ID
 */
export const getPaymentGatewayKey = (): string => {
  return PAYTM_MID;
};

/**
 * Get Paytm environment
 */
export const getPaytmEnvironment = (): string => {
  return PAYTM_ENVIRONMENT;
};
