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
  preparePaymentNotes,
  setNonRefundableParams
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
      
      // For one-time packages, don't enable autopay
      const enableAutoPay = !isOneTimePackage;
      
      // Determine if this package is eligible for recurring payments (autopay)
      const canUseRecurring = !isOneTimePackage && isRecurringPaymentEligible(
        selectedPackage.paymentType,
        selectedPackage.billingCycle
      );
      
      // Calculate the total amount to be charged initially
      let initialAmount = selectedPackage.price || 999;
      if (!isOneTimePackage && selectedPackage.setupFee) {
        initialAmount += selectedPackage.setupFee;
      }
      
      // For recurring packages, add advance payment if applicable
      if (!isOneTimePackage && selectedPackage.advancePaymentMonths > 0) {
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
      
      // Prepare payment notes with correct flags
      const notes = preparePaymentNotes(user.id, selectedPackage, isOneTimePackage);
      
      // Calculate next billing date for recurring payments
      let nextBillingDate = new Date();
      if (canUseRecurring) {
        const advanceMonths = selectedPackage.advancePaymentMonths || 0;
        nextBillingDate = calculateNextBillingDate(
          selectedPackage.billingCycle, 
          advanceMonths
        );
      }
      
      // For recurring plans, create a subscription
      let subscriptionId: string | undefined;
      
      if (canUseRecurring) {
        try {
          console.log("Setting up recurring payment plan for package:", selectedPackage.title);
          
          // Create a plan (in a real implementation, this would be done on your backend)
          const planId = await createSubscriptionPlan({
            packageId: selectedPackage.id,
            amount: selectedPackage.price,
            currency: 'INR',
            billingCycle: selectedPackage.billingCycle,
            name: selectedPackage.title,
            description: `${selectedPackage.title} (${selectedPackage.billingCycle})`,
            paymentType: selectedPackage.paymentType
          });
          
          // Create a subscription using the plan (also would be on backend)
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
        
        // For subscription payments, add subscription_id only
        if (canUseRecurring && subscriptionId) {
          console.log("Using subscription mode with subscription ID:", subscriptionId);
          options.subscription_id = subscriptionId;
          // Do NOT set recurring: true as it's not needed and can cause conflicts
        } else {
          // For one-time payments, add amount
          console.log("Using one-time payment mode with amount:", amountInPaise);
          options.amount = amountInPaise;
        }
        
        // Set non-refundable parameters to prevent automatic refunds
        setNonRefundableParams(options);

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
              subscription_id: subscriptionId,
              // Add non-refundable flag to prevent automatic refunds
              isRefundable: false,
              enableAutoPay: !isOneTimePackage
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
