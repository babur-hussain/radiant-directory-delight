
import { useState, useRef, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { ISubscriptionPackage } from '@/models/SubscriptionPackage';
import { 
  ensureRazorpayAvailable, 
  RAZORPAY_KEY_ID,
  checkRazorpayCompatibility
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
  const razorpayInstanceRef = useRef<any>(null);
  
  // Cleanup function to ensure Razorpay instances are properly closed
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
    
    // Check device compatibility
    const compatibility = checkRazorpayCompatibility();
    if (!compatibility.compatible) {
      const errorMsg = `Payment may not work in this browser: ${compatibility.reason}. Please try using a different browser or device.`;
      toast({
        title: "Browser Compatibility Issue",
        description: errorMsg,
        variant: "destructive"
      });
      console.warn("Razorpay compatibility issue:", compatibility.reason);
      // Continue anyway - we'll still try, but warned the user
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Close any existing Razorpay instance
      if (razorpayInstanceRef.current) {
        try {
          razorpayInstanceRef.current.close();
          razorpayInstanceRef.current = null;
        } catch (err) {
          console.error('Error closing previous Razorpay instance:', err);
        }
      }
      
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
      
      // Add device detection for debugging
      const deviceInfo = {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        isMobile: /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
      };
      console.log("Device info for payment:", deviceInfo);
      
      // Open Razorpay checkout for payment
      return new Promise((resolve, reject) => {
        try {
          // Build Razorpay options for key-only mode (amount-based payment)
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
              
              // Reset the razorpay instance reference
              razorpayInstanceRef.current = null;
              
              // Include the autopay details from the server response
              resolve({
                ...response,
                ...result, // Include all data from the server
                isRecurring: isRecurringPayment,
                enableAutoPay: enableAutoPay,
                // Add flags to prevent refunds
                preventRefunds: true,
                isNonRefundable: true,
                autoRefund: false,
                deviceInfo: deviceInfo
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
              
              // Reset the razorpay instance reference
              razorpayInstanceRef.current = null;
              
              reject(new Error('Payment cancelled by user'));
            }
          );
          
          console.log("Initializing Razorpay with options:", JSON.stringify(options, null, 2));
          
          // Create and open Razorpay checkout
          try {
            const razorpay = createRazorpayCheckout(options);
            
            // Store the instance reference for cleanup
            razorpayInstanceRef.current = razorpay;
            
            // Set up additional event handlers for better error tracking
            razorpay.on('payment.error', (err: any) => {
              console.error("Razorpay payment error:", err);
              
              let errorMessage = "There was a problem processing your payment.";
              if (err && err.error && err.error.description) {
                errorMessage = err.error.description;
              }
              
              // Reset the razorpay instance reference
              razorpayInstanceRef.current = null;
              
              // Show error toast
              toast({
                title: "Payment Failed",
                description: errorMessage,
                variant: "destructive"
              });
              
              reject(err);
            });
            
            // Dispatch event to close the payment summary dialog
            window.dispatchEvent(new CustomEvent('razorpay-opened'));
            
            // Finally, open the payment modal
            razorpay.open();
            console.log("Razorpay checkout modal opened");
          } catch (razorpayError) {
            console.error("Error during Razorpay checkout creation:", razorpayError);
            
            // Reset the razorpay instance reference
            razorpayInstanceRef.current = null;
            
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
