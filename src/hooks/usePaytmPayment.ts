
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
      
      // Generate order ID
      const orderId = `ORDER_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      
      // Handle payment flow
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
          
          // For demo purposes, simulate payment processing
          // In production, this would integrate with actual Paytm API
          console.log("Initiating payment with order ID:", orderId);
          console.log("Payment amount:", totalAmount);
          
          // Store reference for cleanup
          paytmInstanceRef.current = { orderId, amount: totalAmount };
          
          // Note: This is a demo implementation
          // In production, you would integrate with actual Paytm payment gateway
          setTimeout(() => {
            toast({
              title: "Demo Mode",
              description: "This is a demo payment gateway. In production, integrate with actual Paytm API.",
            });
          }, 1000);
          
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
