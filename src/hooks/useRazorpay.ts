
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { ISubscriptionPackage } from '@/models/SubscriptionPackage';
import { loadRazorpayScript, isRazorpayAvailable } from '@/utils/razorpayLoader';
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
  const createSubscription = async (packageData: ISubscriptionPackage, useOneTimePreferred = false): Promise<any> => {
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
      
      // Determine payment type
      // If useOneTimePreferred is true, we'll use one-time payment even for recurring packages
      const isOneTime = packageData.paymentType === 'one-time' || useOneTimePreferred;
      console.log(`Processing payment as ${isOneTime ? 'one-time' : 'subscription'} payment`);
      
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
        useOneTimePreferred
      );
      
      console.log("Received result from backend:", result);
      
      // Open Razorpay checkout based on payment type
      return new Promise((resolve, reject) => {
        try {
          // Build Razorpay options
          const options = buildRazorpayOptions(
            user,
            packageData,
            customerData,
            result,
            isOneTime,
            (response) => resolve(response),
            () => {
              console.log("Payment modal dismissed by user");
              reject(new Error('Payment cancelled by user'));
            }
          );
          
          console.log("Initializing Razorpay with options:", JSON.stringify(options, null, 2));
          const razorpay = createRazorpayCheckout(options);
          razorpay.open();
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
