
import { toast as toastFunction } from '@/hooks/use-toast';

// Paytm configuration - replace with your actual credentials
const PAYTM_MID = 'rxazcv89315285244163'; // Replace with your actual merchant ID
const PAYTM_ENVIRONMENT = 'TEST'; // Change to 'PROD' for production

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
    
    // Use production URL for PROD environment
    if (PAYTM_ENVIRONMENT === 'PROD') {
      script.src = `https://securegw.paytm.in/merchantpgpui/checkoutjs/merchants/${PAYTM_MID}.js`;
    } else {
      script.src = `https://securegw-stage.paytm.in/merchantpgpui/checkoutjs/merchants/${PAYTM_MID}.js`;
    }
    
    script.async = true;
    script.crossOrigin = 'anonymous';
    
    script.onload = () => {
      console.log('Paytm script loaded successfully');
      
      // Verify CheckoutJS is available
      if ((window as any).Paytm && (window as any).Paytm.CheckoutJS) {
        resolve(true);
      } else {
        console.error('Paytm CheckoutJS not found after script load');
        if (toast) {
          toast({
            title: "Error",
            description: "Payment gateway not properly initialized. Please refresh and try again.",
            variant: "destructive"
          });
        }
        resolve(false);
      }
    };
    
    script.onerror = (error) => {
      console.error('Failed to load Paytm script:', error);
      if (toast) {
        toast({
          title: "Error",
          description: "Failed to load payment gateway. Please refresh and try again.",
          variant: "destructive"
        });
      }
      resolve(false);
    };
    
    // Remove any existing Paytm scripts
    const existingScript = document.querySelector(`script[src*="merchants/${PAYTM_MID}.js"]`);
    if (existingScript) {
      existingScript.remove();
    }
    
    document.head.appendChild(script);
  });
};

/**
 * Check if payment gateway is available
 */
export const isPaymentGatewayAvailable = (): boolean => {
  return typeof (window as any).Paytm !== 'undefined' && 
         typeof (window as any).Paytm.CheckoutJS !== 'undefined';
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

/**
 * Initialize Paytm checkout
 */
export const initializePaytmCheckout = (config: any): Promise<any> => {
  return new Promise((resolve, reject) => {
    if (!isPaymentGatewayAvailable()) {
      reject(new Error('Paytm payment gateway not loaded'));
      return;
    }

    try {
      (window as any).Paytm.CheckoutJS.init(config).then(resolve).catch(reject);
    } catch (error) {
      reject(error);
    }
  });
};
