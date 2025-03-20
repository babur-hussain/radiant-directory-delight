
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { 
  loadRazorpayScript, 
  isRazorpayAvailable, 
  RAZORPAY_KEY_ID, 
  generateOrderId, 
  convertToPaise,
  createRazorpaySubscription
} from '@/utils/razorpay';
import { ISubscriptionPackage } from '@/models/SubscriptionPackage';
import { useAuth } from '@/hooks/useAuth';

interface RazorpayOptions {
  selectedPackage: ISubscriptionPackage;
  onSuccess: (response: any) => void;
  onFailure: (error: any) => void;
}

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

  const initiatePayment = async ({ selectedPackage, onSuccess, onFailure }: RazorpayOptions) => {
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
      
      // Determine if this is a one-time package
      const isOneTimePackage = selectedPackage.paymentType === "one-time";
      
      // Calculate advance payment months (if applicable for recurring payments)
      const advanceMonths = isOneTimePackage ? 0 : (selectedPackage.advancePaymentMonths || 0);
      
      // Calculate the setup fee (for recurring payments)
      const setupFee = isOneTimePackage ? 0 : (selectedPackage.setupFee || 0);
      
      // Calculate recurring amount
      const recurringAmount = isOneTimePackage ? 0 : (selectedPackage.price || 0);
      
      // Calculate advance payment amount
      const advanceAmount = advanceMonths * recurringAmount;
      
      // Calculate the total initial payment
      let totalPaymentAmount = isOneTimePackage 
        ? (selectedPackage.price || 999) // For one-time packages
        : (setupFee + advanceAmount); // For recurring (setup fee + advance payment)
      
      // Ensure minimum amount
      if (totalPaymentAmount < 1) {
        totalPaymentAmount = 1; // Minimum 1 rupee
      }

      // Create a valid order ID without special characters
      const orderId = generateOrderId();
      
      // Convert amount to paise
      const amountInPaise = convertToPaise(totalPaymentAmount);
      
      console.log(`Setting up payment for ${selectedPackage.title} with amount ${totalPaymentAmount} (${amountInPaise} paise)`);
      
      // Common Razorpay options that will be used for both one-time and recurring
      const commonOptions = {
        key: RAZORPAY_KEY_ID,
        name: 'Grow Bharat Vyapaar',
        description: `Payment for ${selectedPackage.title}`,
        image: 'https://example.com/your_logo.png', // Add your logo URL here
        prefill: {
          name: user?.fullName || '',
          email: user?.email || '',
          contact: user?.phone || ''
        },
        theme: {
          color: '#3399cc'
        },
        modal: {
          escape: false,
          ondismiss: function() {
            console.log("Checkout form closed by user");
            setIsLoading(false);
            onFailure({ message: "Payment cancelled by user" });
          }
        }
      };
      
      if (isOneTimePackage) {
        // One-time payment using standard Razorpay checkout
        const options = {
          ...commonOptions,
          amount: amountInPaise,
          currency: 'INR',
          order_id: orderId,
          notes: {
            packageId: selectedPackage.id,
            packageType: "one-time"
          },
          handler: function(response: any) {
            // Add payment type to the response
            response.paymentType = "one-time";
            response.packageId = selectedPackage.id;
            response.packageName = selectedPackage.title;
            response.amount = totalPaymentAmount;
            
            console.log("One-time payment successful, Razorpay response:", response);
            
            // Show success toast
            toast({
              title: "Payment Successful",
              description: `Your payment for ${selectedPackage.title} was successful.`,
              variant: "default"
            });
            
            setIsLoading(false);
            onSuccess(response);
          }
        };
        
        console.log("Opening Razorpay one-time payment with options:", options);
        
        // Create a new Razorpay instance with minimal options
        const razorpay = new window.Razorpay(options);
        
        // Handle payment failures
        razorpay.on('payment.failed', function(response: any) {
          console.error('Payment failed:', response.error);
          
          const errorMessage = response.error.description || 'Payment failed. Please try again.';
          
          toast({
            title: "Payment Failed",
            description: errorMessage,
            variant: "destructive"
          });
          
          setIsLoading(false);
          setError(errorMessage);
          onFailure(response.error);
        });
        
        // Open the Razorpay checkout
        razorpay.open();
      } else {
        // Recurring subscription payment
        try {
          // Calculate when the first recurring payment will happen
          const startDate = new Date();
          if (advanceMonths > 0) {
            startDate.setMonth(startDate.getMonth() + advanceMonths);
          }
          const formattedStartDate = startDate.toLocaleDateString();
          
          // For recurring subscription with autopay
          // Important: We need to properly setup subscription parameters
          const subscriptionId = `sub${Date.now()}`;
          
          const options = {
            ...commonOptions,
            amount: amountInPaise,
            currency: 'INR',
            // Don't use subscription_id directly in options
            notes: {
              packageId: selectedPackage.id,
              packageType: "recurring",
              billingCycle: selectedPackage.billingCycle || "yearly",
              setupFee: setupFee,
              recurringAmount: recurringAmount,
              advanceMonths: advanceMonths,
              nextBillingDate: startDate.toISOString(),
              subscription_id: subscriptionId
            },
            // Setup proper payment capture
            payment_capture: 1,
            // Add these options that are required by Razorpay for recurring
            method: {
              netbanking: true,
              card: true,
              upi: true,
              wallet: true
            },
            // Standard payment callback
            handler: function(response: any) {
              // Add subscription details to the response
              response.paymentType = "recurring";
              response.packageId = selectedPackage.id;
              response.packageName = selectedPackage.title;
              response.amount = totalPaymentAmount;
              response.setupFee = setupFee;
              response.recurringAmount = recurringAmount;
              response.advanceMonths = advanceMonths;
              response.billingCycle = selectedPackage.billingCycle || 'yearly';
              
              // Generate a subscription ID if not provided by Razorpay
              response.subscriptionId = response.razorpay_subscription_id || subscriptionId;
              
              // Add next billing date to the response
              response.nextBillingDate = startDate.toISOString();
              
              console.log("Subscription setup payment successful, response:", response);
              
              toast({
                title: "Subscription Initialized",
                description: advanceMonths > 0 
                  ? `Your subscription to ${selectedPackage.title} has been activated with ${advanceMonths} months advance payment. Recurring payment of ₹${recurringAmount} will start from ${formattedStartDate}.` 
                  : `Your subscription to ${selectedPackage.title} has been activated. You will be charged ₹${recurringAmount} ${selectedPackage.billingCycle || 'yearly'}.`,
                variant: "default"
              });
              
              setIsLoading(false);
              onSuccess(response);
            }
          };
          
          console.log("Opening Razorpay subscription payment with options:", options);
          
          // Create a new Razorpay instance
          const razorpay = new window.Razorpay(options);
          
          // Handle payment failures
          razorpay.on('payment.failed', function(response: any) {
            console.error('Subscription payment failed:', response.error);
            
            const errorMessage = response.error.description || 'Subscription payment failed. Please try again.';
            
            toast({
              title: "Subscription Setup Failed",
              description: errorMessage,
              variant: "destructive"
            });
            
            setIsLoading(false);
            setError(errorMessage);
            onFailure(response.error);
          });
          
          // Open the Razorpay checkout
          razorpay.open();
        } catch (subscriptionError) {
          console.error('Error creating subscription:', subscriptionError);
          throw new Error('Failed to create subscription. Please try again later.');
        }
      }
      
      // Log for debugging
      console.log("Opened Razorpay with options:", {
        packageId: selectedPackage.id,
        packageTitle: selectedPackage.title,
        amount: totalPaymentAmount,
        orderId: orderId
      });
      
    } catch (error) {
      console.error('Error opening Razorpay:', error);
      setError(error.message || 'An error occurred while processing payment');
      
      toast({
        title: "Payment Error",
        description: error.message || "Could not open payment gateway. Please try again later.",
        variant: "destructive"
      });
      
      onFailure(error);
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    initiatePayment
  };
};
