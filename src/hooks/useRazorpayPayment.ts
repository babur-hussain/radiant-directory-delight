
import { useState, useRef, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { ISubscriptionPackage } from '@/models/SubscriptionPackage';
import { validatePaymentRequest, validateCustomerData } from '@/utils/payment/paymentValidator';
import { loadPaymentScript } from '@/utils/payment/paymentScriptLoader';
import { createPaymentHandlers } from '@/utils/payment/paymentEventHandlers';
import { 
  createRazorpayCheckout, 
  buildRazorpayOptions 
} from '@/services/razorpayService';

export const useRazorpayPayment = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const razorpayInstanceRef = useRef<any>(null);
  
  // Cleanup function
  useEffect(() => {
    return () => {
      if (razorpayInstanceRef.current) {
        try {
          razorpayInstanceRef.current.close();
          razorpayInstanceRef.current = null;
        } catch (err) {
          console.error('Error closing Razorpay instance on unmount:', err);
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
      
      // Close any existing instance
      if (razorpayInstanceRef.current) {
        try {
          razorpayInstanceRef.current.close();
          razorpayInstanceRef.current = null;
        } catch (err) {
          console.error('Error closing previous Razorpay instance:', err);
        }
      }
      
      // Load payment script - pass toast function
      const isLoaded = await loadPaymentScript(toast);
      if (!isLoaded) {
        throw new Error('Failed to load payment gateway');
      }
      
      // Prepare customer data
      const customerData = validateCustomerData(user!);
      
      // Calculate total amount including setup fee
      const setupFee = packageData.setupFee || 0;
      const basePrice = packageData.price || 0;
      const totalAmount = basePrice + setupFee;
      console.log(`Calculated payment amount: Base price: ${basePrice} + Setup fee: ${setupFee} = Total: ${totalAmount}`);
      
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
          
          // Build options and create checkout
          // Fix the type issue by providing all required properties for SubscriptionResult
          const subscriptionResult = {
            amount: totalAmount * 100, // Convert to paise and include setup fee
            isOneTime: packageData.paymentType === 'one-time',
            isSubscription: packageData.paymentType === 'recurring',
            enableAutoPay: packageData.paymentType === 'recurring' && enableAutoPay,
            setupFee: setupFee
          };
          
          const options = buildRazorpayOptions(
            user!,
            packageData,
            customerData,
            subscriptionResult,
            packageData.paymentType === 'one-time',
            enableAutoPay,
            handleSuccess,
            handleDismiss
          );
          
          console.log("Initializing Razorpay with options:", options);
          
          const razorpay = createRazorpayCheckout(options);
          razorpayInstanceRef.current = razorpay;
          
          razorpay.on('payment.error', handleError);
          window.dispatchEvent(new CustomEvent('razorpay-opened'));
          razorpay.open();
          
        } catch (err) {
          console.error('Razorpay initialization error:', err);
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
