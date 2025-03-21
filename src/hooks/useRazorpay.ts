
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { ISubscriptionPackage } from '@/models/SubscriptionPackage';
import { 
  ensureRazorpayAvailable, 
  RAZORPAY_KEY_ID 
} from '@/utils/razorpayLoader';
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
      const errorMsg = 'User must be logged in to create a subscription';
      toast({
        title: "Authentication Required",
        description: errorMsg,
        variant: "destructive"
      });
      throw new Error(errorMsg);
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Ensure Razorpay is loaded
      const isLoaded = await ensureRazorpayAvailable();
      if (!isLoaded) {
        const errorMsg = 'Failed to load payment gateway. Please check your internet connection and try again.';
        toast({
          title: "Payment Error",
          description: errorMsg,
          variant: "destructive"
        });
        throw new Error(errorMsg);
      }
      
      // Determine if this is a one-time or recurring payment
      const isRecurringPayment = packageData.paymentType === 'recurring' && enableAutoPay;
      console.log(`Processing payment as ${isRecurringPayment ? 'recurring' : 'one-time'} payment with autopay: ${enableAutoPay}`);
      
      // Prepare customer data with fallbacks to avoid empty values
      const customerData = {
        name: user.fullName || user.name || user.email?.split('@')[0] || 'Customer',
        email: user.email || '',
        phone: user.phone || ''
      };
      
      // Validate critical package data
      if (!packageData.id || !packageData.price) {
        const errorMsg = 'Invalid package data: missing required fields';
        toast({
          title: "Configuration Error",
          description: errorMsg,
          variant: "destructive"
        });
        throw new Error(errorMsg);
      }
      
      // Create subscription via edge function
      console.log("Creating subscription via edge function with autopay:", enableAutoPay);
      const result = await createSubscriptionViaEdgeFunction(
        user,
        packageData,
        customerData,
        !isRecurringPayment, // Use one-time API if not recurring
        enableAutoPay       // Pass the autopay preference
      );
      
      console.log("Received result from backend:", result);
      
      // Validate response from backend
      if (!result || !result.order || !result.order.id) {
        const errorMsg = 'Invalid response from server: missing order information';
        toast({
          title: "Server Error",
          description: errorMsg,
          variant: "destructive"
        });
        throw new Error(errorMsg);
      }
      
      // Validate that the order ID format is correct
      if (!result.order.id.startsWith('order_')) {
        const errorMsg = 'Invalid order ID format from server';
        console.error(errorMsg, result.order.id);
        toast({
          title: "Server Error",
          description: errorMsg,
          variant: "destructive"
        });
        throw new Error(errorMsg);
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
            enableAutoPay,      // Add autopay preference
            (response) => {
              console.log("Payment success callback triggered with:", response);
              
              // Show success toast
              toast({
                title: "Payment Successful",
                description: `Your payment for ${packageData.title} was successful.`,
                variant: "success"
              });
              
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
              
              // Show info toast
              toast({
                title: "Payment Cancelled",
                description: "You cancelled the payment process.",
                variant: "info"
              });
              
              reject(new Error('Payment cancelled by user'));
            }
          );
          
          console.log("Initializing Razorpay with options:", JSON.stringify(options, null, 2));
          
          // Create and open Razorpay checkout
          try {
            const razorpay = createRazorpayCheckout(options);
            
            // Set up additional event handlers for better error tracking
            razorpay.on('payment.error', (err: any) => {
              console.error("Razorpay payment error:", err);
              
              let errorMessage = "There was a problem processing your payment.";
              if (err && err.error && err.error.description) {
                errorMessage = err.error.description;
              }
              
              // Show error toast
              toast({
                title: "Payment Failed",
                description: errorMessage,
                variant: "destructive"
              });
              
              reject(err);
            });
            
            // Finally, open the payment modal
            razorpay.open();
            console.log("Razorpay checkout modal opened");
          } catch (razorpayError) {
            console.error("Error during Razorpay checkout creation:", razorpayError);
            
            const errorMessage = razorpayError instanceof Error ? 
              razorpayError.message : 
              "Failed to initialize the payment gateway.";
              
            // Show error toast
            toast({
              title: "Checkout Error",
              description: errorMessage,
              variant: "destructive"
            });
            
            reject(razorpayError);
          }
        } catch (err) {
          console.error('Razorpay initialization error:', err);
          
          const errorMessage = err instanceof Error ? 
            err.message : 
            "Failed to initialize payment gateway";
            
          // Show error toast
          toast({
            title: "Payment Error",
            description: errorMessage,
            variant: "destructive"
          });
          
          reject(new Error(errorMessage));
        }
      });
    } catch (error) {
      console.error('Error creating subscription:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(errorMessage);
      
      // Only show toast if not already shown in other error handlers
      if (!errorMessage.includes('User must be logged in') && 
          !errorMessage.includes('Failed to load payment gateway') &&
          !errorMessage.includes('Invalid package data') &&
          !errorMessage.includes('Invalid response from server')) {
        toast({
          title: "Payment Error",
          description: errorMessage,
          variant: "destructive"
        });
      }
      
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
