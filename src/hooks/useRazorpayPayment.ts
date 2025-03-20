
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { 
  loadRazorpayScript, 
  isRazorpayAvailable, 
  getRazorpayKey,
  generateReceiptId,
  convertToPaise,
  createRazorpayCheckout,
  formatNotesForRazorpay,
  RazorpayOptions,
  RazorpayResponse,
  isRecurringPaymentEligible,
  calculateNextBillingDate,
  formatSubscriptionDate,
  createSubscriptionPlan,
  createSubscription,
  shouldUseSubscriptionAPI
} from '@/utils/razorpay';
import { generateOrderId } from '@/utils/id-generator';
import { ISubscriptionPackage } from '@/models/SubscriptionPackage';
import { useAuth } from '@/hooks/useAuth';

interface PaymentOptions {
  selectedPackage: ISubscriptionPackage;
  onSuccess: (response: any) => void;
  onFailure: (error: any) => void;
}

/**
 * Hook for handling Razorpay payments, including one-time and recurring subscriptions
 * 
 * IMPORTANT PRODUCTION NOTICE:
 * This implementation uses mock subscription creation for development/testing purposes.
 * 
 * In a production environment, the subscription plan creation and subscription creation
 * should be implemented on your backend server with proper authentication using
 * Razorpay's APIs:
 * 
 * 1. Create Plan: POST https://api.razorpay.com/v1/plans
 * 2. Create Subscription: POST https://api.razorpay.com/v1/subscriptions
 */
export const useRazorpayPayment = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const loadScript = async (): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      await loadRazorpayScript();
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('Error loading Razorpay script:', error);
      setError('Failed to load payment gateway. Please try again later.');
      setIsLoading(false);
      return false;
    }
  };

  const initiatePayment = async ({ selectedPackage, onSuccess, onFailure }: PaymentOptions) => {
    if (isLoading) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // First ensure the script is loaded
      const scriptLoaded = await loadScript();
      if (!scriptLoaded) {
        throw new Error('Payment gateway could not be loaded');
      }
      
      if (!isRazorpayAvailable()) {
        throw new Error('Payment gateway is not available. Please refresh the page.');
      }
      
      if (!user) {
        throw new Error('User authentication required');
      }
      
      // Check if this is a one-time payment or subscription
      const isOneTimePackage = selectedPackage.paymentType === "one-time";
      
      // Determine if this package is eligible for recurring payments (autopay)
      const canUseRecurring = !isOneTimePackage && 
                              isRecurringPaymentEligible(
                                selectedPackage.paymentType,
                                selectedPackage.billingCycle
                              ) && 
                              shouldUseSubscriptionAPI(); // Only use subscription API if enabled
      
      // Calculate the total amount to be charged initially
      let initialAmount = isOneTimePackage 
        ? selectedPackage.price || 999 
        : selectedPackage.setupFee || 0;
        
      // For recurring packages, add advance payment if applicable
      if (!isOneTimePackage) {
        const advanceMonths = selectedPackage.advancePaymentMonths || 0;
        const recurringAmount = selectedPackage.price || 0;
        const advanceAmount = advanceMonths * recurringAmount;
        initialAmount += advanceAmount;
      }
      
      // Ensure minimum amount (1 rupee)
      if (initialAmount < 1) {
        initialAmount = 1;
      }
      
      // Generate a receipt ID
      const receiptId = generateReceiptId();
      
      // Convert amount to paise
      const amountInPaise = convertToPaise(initialAmount);
      
      console.log(`Setting up payment for ${selectedPackage.title} with amount ${initialAmount} (${amountInPaise} paise)`);
      
      // Create basic notes object with strings only
      const notes = {
        packageId: selectedPackage.id,
        packageName: selectedPackage.title,
        amount: initialAmount.toString(),
        receiptId: receiptId,
        paymentType: isOneTimePackage ? "one-time" : "recurring"
      };
      
      // Calculate next billing date for recurring payments
      let nextBillingDate = new Date();
      if (canUseRecurring) {
        const advanceMonths = selectedPackage.advancePaymentMonths || 0;
        nextBillingDate = calculateNextBillingDate(
          selectedPackage.billingCycle, 
          advanceMonths
        );
      }
      
      // For recurring plans, create a subscription (only if feature is enabled)
      let subscriptionId: string | undefined;
      
      if (canUseRecurring) {
        try {
          console.log("Setting up recurring payment plan for package:", selectedPackage.title);
          
          /**
           * PRODUCTION IMPLEMENTATION NOTE:
           * 
           * In a production environment, the following subscription plan creation
           * and subscription creation should be implemented on your backend server 
           * with proper authentication using Razorpay's APIs:
           * 
           * 1. Create Plan: POST https://api.razorpay.com/v1/plans
           * 2. Create Subscription: POST https://api.razorpay.com/v1/subscriptions
           * 
           * These API calls require your Razorpay API key and secret, which should
           * never be exposed in client-side code.
           */
          
          // Step 1: Create a plan (in a real implementation, this would be done on your backend)
          const planId = await createSubscriptionPlan({
            packageId: selectedPackage.id,
            amount: selectedPackage.price,
            currency: 'INR',
            billingCycle: selectedPackage.billingCycle,
            name: selectedPackage.title,
            description: `${selectedPackage.title} (${selectedPackage.billingCycle})`,
            paymentType: selectedPackage.paymentType
          });
          
          // Step 2: Create a subscription using the plan (also would be on backend)
          subscriptionId = await createSubscription(
            planId,
            selectedPackage,
            {
              name: user?.fullName || '',
              email: user?.email || '',
              contact: user?.phone || ''
            }
          );
          
          console.log(`Created subscription with ID: ${subscriptionId}`);
        } catch (err) {
          console.error("Error creating subscription plan:", err);
          // Fall back to one-time payment if subscription creation fails
          console.log("Falling back to one-time payment method");
          subscriptionId = undefined;
        }
      }
      
      try {
        // Configure Razorpay options
        const options: RazorpayOptions = {
          key: getRazorpayKey(),
          name: 'Grow Bharat Vyapaar',
          description: `Payment for ${selectedPackage.title}`,
          image: 'https://example.com/your_logo.png', // Replace with actual logo URL
          currency: 'INR',
          prefill: {
            name: user?.fullName || '',
            email: user?.email || '',
            contact: user?.phone || ''
          },
          notes: notes,
          theme: {
            color: '#3399cc'
          },
          remember_customer: true,
          modal: {
            escape: false,
            backdropclose: false,
            ondismiss: function() {
              console.log("Checkout form closed by user");
              setIsLoading(false);
              
              try {
                onFailure({ message: "Payment cancelled by user" });
              } catch (callbackErr) {
                console.error("Error in onFailure callback:", callbackErr);
              }
            }
          }
        };
        
        // For subscription payments with valid subscription ID, add subscription_id only
        if (canUseRecurring && subscriptionId) {
          console.log("Using subscription mode with subscription ID:", subscriptionId);
          options.subscription_id = subscriptionId;
          // Do NOT set amount or other conflicting params for subscriptions
        } else {
          // For one-time payments or if subscription creation failed, add amount
          console.log("Using one-time payment mode with amount:", amountInPaise);
          options.amount = amountInPaise;
          
          // For production: consider creating an order first and adding order_id
          // This would be done through your backend
        }

        // Create and open Razorpay checkout
        const razorpay = createRazorpayCheckout(options);
        
        // Set up payment handler
        razorpay.on('payment.success', function(resp: any) {
          console.log('Payment successful:', resp);
          
          toast({
            title: "Payment Successful",
            description: `Your payment for ${selectedPackage.title} was successful.`,
          });
          
          setIsLoading(false);
          
          try {
            onSuccess({
              ...resp,
              packageId: selectedPackage.id,
              packageName: selectedPackage.title,
              amount: initialAmount,
              paymentType: isOneTimePackage ? "one-time" : "recurring",
              receiptId,
              isRecurring: canUseRecurring,
              billingCycle: selectedPackage.billingCycle,
              nextBillingDate: canUseRecurring ? formatSubscriptionDate(nextBillingDate) : undefined,
              advanceMonths: selectedPackage.advancePaymentMonths || 0,
              subscription_id: subscriptionId
            });
          } catch (callbackErr) {
            console.error("Error in onSuccess callback:", callbackErr);
          }
        });
        
        // Handle payment failures
        razorpay.on('payment.failed', function(resp: any) {
          console.error('Payment failed:', resp.error);
          
          const errorMessage = resp.error?.description || 'Payment failed. Please try again.';
          
          toast({
            title: "Payment Failed",
            description: errorMessage,
            variant: "destructive"
          });
          
          setIsLoading(false);
          setError(errorMessage);
          
          try {
            onFailure(resp.error || { message: errorMessage });
          } catch (callbackErr) {
            console.error("Error in onFailure callback:", callbackErr);
          }
        });
        
        // Open the Razorpay checkout
        razorpay.open();
      } catch (error) {
        console.error("Error in Razorpay checkout:", error);
        throw new Error("Could not open payment gateway. Please try again.");
      }
      
    } catch (error) {
      console.error('Error opening Razorpay:', error);
      const errorMessage = error instanceof Error ? error.message : 'An error occurred while processing payment';
      setError(errorMessage);
      
      toast({
        title: "Payment Error",
        description: errorMessage,
        variant: "destructive"
      });
      
      try {
        onFailure(error);
      } catch (callbackErr) {
        console.error("Error in onFailure callback:", callbackErr);
      }
      
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    initiatePayment
  };
};
