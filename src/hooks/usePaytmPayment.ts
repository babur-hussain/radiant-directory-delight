
import { useState, useRef, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { ISubscriptionPackage } from '@/models/SubscriptionPackage';
import { validatePaymentRequest, validateCustomerData } from '@/utils/payment/paymentValidator';
import { loadPaymentScript, isPaymentGatewayAvailable } from '@/utils/payment/paymentScriptLoader';
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
      
      // Call backend to get payment configuration
      const response = await fetch('/functions/v1/paytm-integration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          packageData,
          customerData,
          userId: user!.uid,
          enableAutoPay
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to initialize payment');
      }

      const paymentConfig = await response.json();
      
      // Handle payment flow with real Paytm integration
      return new Promise((resolve, reject) => {
        try {
          const { handleSuccess, handleDismiss, handleError } = createPaymentHandlers(
            packageData,
            toast,
            (response) => {
              // Only resolve if payment was actually successful
              if (response.STATUS === 'TXN_SUCCESS' && response.paymentVerified) {
                resolve(response);
              } else {
                reject(new Error('Payment verification failed'));
              }
            },
            () => reject(new Error('Payment cancelled by user')),
            reject
          );
          
          // Configure Paytm checkout
          const config = {
            "root": "",
            "flow": "DEFAULT",
            "data": {
              "orderId": paymentConfig.orderId,
              "token": paymentConfig.txnToken,
              "tokenType": "TXN_TOKEN",
              "amount": paymentConfig.amount.toString()
            },
            "handler": {
              "notifyMerchant": function(eventName: string, data: any) {
                console.log("Paytm event:", eventName, data);
                
                if (eventName === 'APP_CLOSED') {
                  handleDismiss();
                }
              }
            }
          };

          // Initialize and invoke Paytm payment
          if (isPaymentGatewayAvailable() && (window as any).Paytm?.CheckoutJS) {
            (window as any).Paytm.CheckoutJS.init(config).then(() => {
              return (window as any).Paytm.CheckoutJS.invoke();
            }).then((paymentResponse: any) => {
              if (paymentResponse.STATUS === 'TXN_SUCCESS') {
                handleSuccess(paymentResponse);
              } else {
                handleError(paymentResponse);
              }
            }).catch(handleError);
          } else {
            throw new Error('Paytm payment gateway not available');
          }
          
          // Store reference for cleanup
          paytmInstanceRef.current = { orderId: paymentConfig.orderId, amount: totalAmount };
          
        } catch (err) {
          console.error('Payment initialization error:', err);
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
