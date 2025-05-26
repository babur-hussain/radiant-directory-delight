
import { useState, useRef, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { ISubscriptionPackage } from '@/models/SubscriptionPackage';
import { validatePaymentRequest, validateCustomerData } from '@/utils/payment/paymentValidator';
import { loadPaymentScript, getPaymentGatewayKey, getPaytmEnvironment } from '@/utils/payment/paymentScriptLoader';
import { createPaymentHandlers } from '@/utils/payment/paymentEventHandlers';

export const usePaytmPayment = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const paytmInstanceRef = useRef<any>(null);
  
  // Cleanup function
  useEffect(() => {
    return () => {
      if (paytmInstanceRef.current) {
        try {
          paytmInstanceRef.current = null;
        } catch (err) {
          console.error('Error cleaning up Paytm instance:', err);
        }
      }
    };
  }, []);
  
  const initiatePayment = async (packageData: ISubscriptionPackage, enableAutoPay = true) => {
    // Validate request
    const validationError = validatePaymentRequest(user, packageData);
    if (validationError) {
      toast({
        title: "Validation Error",
        description: validationError,
        variant: "destructive"
      });
      throw new Error(validationError);
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Load payment script
      const isLoaded = await loadPaymentScript(toast);
      if (!isLoaded) {
        throw new Error('Failed to load payment gateway');
      }
      
      // Prepare customer data
      const customerData = validateCustomerData(user!);
      
      // Calculate total amount including setup fee
      const totalAmount = (packageData.price || 0) + (packageData.setupFee || 0);
      console.log(`Calculated payment amount: Base price: ${packageData.price} + Setup fee: ${packageData.setupFee} = Total: ${totalAmount}`);
      
      // Generate order ID and transaction token (in production, get from backend)
      const orderId = `ORDER_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      const txnToken = `TXN_TOKEN_${Date.now()}`; // In production, this should come from your backend
      
      // Handle payment flow
      return new Promise((resolve, reject) => {
        try {
          const { handleSuccess, handleDismiss, handleError } = createPaymentHandlers(
            packageData,
            toast,
            resolve,
            () => reject(new Error('Payment cancelled by user')),
            reject
          );
          
          // Configure Paytm checkout
          const config = {
            root: '',
            flow: 'DEFAULT',
            data: {
              orderId: orderId,
              token: txnToken,
              tokenType: 'TXN_TOKEN',
              amount: totalAmount.toString(),
            },
            handler: {
              notifyMerchant: function(eventName: string, data: any) {
                console.log('Paytm event:', eventName, data);
                
                if (eventName === 'APP_CLOSED') {
                  handleDismiss();
                } else if (eventName === 'BACK_BUTTON_PRESSED') {
                  handleDismiss();
                }
              }
            }
          };
          
          console.log("Initializing Paytm with config:", config);
          
          // Mock successful response for demo (in production, this comes from Paytm)
          setTimeout(() => {
            const mockResponse = {
              TXNID: `TXN_${Date.now()}`,
              ORDERID: orderId,
              TXNAMOUNT: totalAmount.toString(),
              STATUS: 'TXN_SUCCESS',
              RESPCODE: '01',
              RESPMSG: 'Txn Success',
              PAYMENTMODE: 'CC',
              BANKNAME: 'DEMO_BANK',
              MID: getPaymentGatewayKey(),
              CHECKSUMHASH: 'demo_checksum'
            };
            
            handleSuccess(mockResponse);
          }, 2000);
          
          // Store reference
          paytmInstanceRef.current = config;
          
          // In production, you would call:
          // if ((window as any).Paytm && (window as any).Paytm.CheckoutJS) {
          //   (window as any).Paytm.CheckoutJS.init(config).then(() => {
          //     (window as any).Paytm.CheckoutJS.invoke();
          //   }).catch((error: any) => {
          //     handleError(error);
          //   });
          // }
          
        } catch (err) {
          console.error('Paytm initialization error:', err);
          const errorMessage = err instanceof Error ? err.message : 'Failed to initialize payment gateway';
          toast({
            title: "Payment Error",
            description: errorMessage,
            variant: "destructive"
          });
          reject(err);
        }
      });
      
    } catch (error) {
      console.error('Error initiating payment:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    isLoading,
    error,
    initiatePayment
  };
};
