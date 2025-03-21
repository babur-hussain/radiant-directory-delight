
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { ISubscriptionPackage } from '@/models/SubscriptionPackage';
import { loadRazorpayScript, isRazorpayAvailable, RAZORPAY_KEY_ID } from '@/utils/razorpayLoader';
import { 
  createSubscriptionViaEdgeFunction, 
  buildRazorpayOptions, 
  createRazorpayCheckout 
} from '@/services/razorpayService';

/**
 * Hook for handling Razorpay payments and subscriptions securely
 */
export const useRazorpay = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Create a subscription on the server and open Razorpay checkout
  const createSubscription = async (packageData: ISubscriptionPackage, enableAutoPay = true): Promise<any> => {
    if (!user) {
      throw new Error('User must be logged in to create a subscription');
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Ensure Razorpay is loaded
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        throw new Error('Failed to load payment gateway');
      }
      
      if (!isRazorpayAvailable()) {
        throw new Error('Payment gateway is not available. Please refresh the page.');
      }
      
      // Determine if this is a one-time or recurring payment
      const isRecurringPayment = packageData.paymentType === 'recurring' && enableAutoPay;
      console.log(`Processing payment as ${isRecurringPayment ? 'recurring' : 'one-time'} payment with autopay: ${enableAutoPay}`);
      
      // Prepare customer data - ensure no empty values
      const customerData = {
        name: user.fullName || user.email?.split('@')[0] || 'Customer',
        email: user.email || '',
        phone: user.phone || ''
      };
      
      // Create subscription via edge function
      const result = await createSubscriptionViaEdgeFunction(
        user,
        packageData,
        customerData,
        !isRecurringPayment, // Use one-time API if not recurring
        enableAutoPay // Pass the autopay preference
      );
      
      console.log("Received result from backend:", result);
      
      if (!result || !result.order) {
        throw new Error('Invalid response from server');
      }
      
      // Open Razorpay checkout for payment
      return new Promise((resolve, reject) => {
        try {
          // Build Razorpay options
          const options = buildRazorpayOptions(
            user,
            packageData,
            customerData,
            result,
            !isRecurringPayment, // isOneTime
            enableAutoPay, // Add autopay preference
            (response) => {
              console.log("Payment success callback triggered with:", response);
              resolve({
                ...response,
                subscription: result.subscription,
                order: result.order,
                isRecurring: isRecurringPayment,
                enableAutoPay: enableAutoPay
              });
            },
            () => {
              console.log("Payment modal dismissed by user");
              reject(new Error('Payment cancelled by user'));
            }
          );
          
          console.log("Initializing Razorpay with options:", JSON.stringify(options, null, 2));
          
          // Create and open Razorpay checkout
          try {
            const razorpay = createRazorpayCheckout(options);
            
            // Set up any additional event handlers if needed
            razorpay.on('payment.error', (err: any) => {
              console.error("Razorpay payment error:", err);
              reject(err);
            });
            
            // Finally, open the payment modal
            razorpay.open();
          } catch (razorpayError) {
            console.error("Error during Razorpay checkout creation:", razorpayError);
            reject(razorpayError);
          }
        } catch (err) {
          console.error('Razorpay initialization error:', err);
          reject(new Error('Failed to initialize payment gateway'));
        }
      });
    } catch (error) {
      console.error('Error creating subscription:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    isLoading,
    error,
    createSubscription
  };
};
