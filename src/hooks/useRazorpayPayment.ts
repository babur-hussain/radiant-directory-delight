
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
      
      // Calculate the amount based on payment type
      const paymentAmount = isOneTimePackage 
        ? (selectedPackage.price || 999) // Default to 999 if price is 0 or undefined
        : (selectedPackage.setupFee || 0);
      
      // Create a mock order ID for demonstration
      // In a real app, this would come from your backend API
      const orderId = generateOrderId();
      
      // Convert amount to paise
      const amountInPaise = convertToPaise(paymentAmount);
      
      console.log(`Setting up payment for ${selectedPackage.title} with amount ${paymentAmount} (${amountInPaise} paise)`);
      
      if (isOneTimePackage) {
        // One-time payment using standard Razorpay checkout
        const options = {
          key: RAZORPAY_KEY_ID,
          amount: amountInPaise,
          currency: 'INR',
          name: 'Grow Bharat Vyapaar',
          description: `Payment for ${selectedPackage.title}`,
          order_id: orderId,
          handler: function(response: any) {
            // Add payment type to the response
            response.paymentType = "one-time";
            
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
        // Recurring subscription using Razorpay Subscription API
        try {
          // Set up subscription options
          const subscriptionOptions = {
            key: RAZORPAY_KEY_ID,
            subscription_id: `sub_${Date.now()}`,
            name: 'Grow Bharat Vyapaar',
            description: `Subscription for ${selectedPackage.title}`,
            prefill: {
              name: user.name || '',
              email: user.email || '',
              contact: user.phone || ''
            },
            notes: {
              packageId: selectedPackage.id,
              packageTitle: selectedPackage.title,
              userId: user.uid
            },
            handler: function(response: any) {
              // Add payment type and subscription info to the response
              response.paymentType = "recurring";
              response.packageId = selectedPackage.id;
              response.packageTitle = selectedPackage.title;
              response.setupFee = selectedPackage.setupFee || 0;
              response.recurringAmount = selectedPackage.price || 0;
              response.billingCycle = selectedPackage.billingCycle || 'yearly';
              
              console.log("Recurring subscription payment successful, Razorpay response:", response);
              
              // Show success toast
              toast({
                title: "Subscription Successful",
                description: `Your subscription for ${selectedPackage.title} was successfully activated.`,
                variant: "default"
              });
              
              setIsLoading(false);
              onSuccess(response);
            }
          };
          
          // For recurring payments, we need to create a subscription first
          const subscriptionData = {
            plan_id: `plan_${selectedPackage.id}`,
            total_count: selectedPackage.billingCycle === 'monthly' ? 12 : 1,
            quantity: 1,
            customer_notify: 1,
            notes: {
              packageId: selectedPackage.id,
              userId: user.uid
            }
          };
          
          console.log("Creating Razorpay subscription with options:", subscriptionOptions);
          
          // In a real implementation, this would be done on your server
          // Here we're simulating it client-side
          const mockSubscriptionResponse = await createRazorpaySubscription(subscriptionData);
          
          // Then setup the payment UI
          const razorpay = new window.Razorpay({
            ...subscriptionOptions,
            subscription_id: mockSubscriptionResponse.id,
          });
          
          // Handle payment failures
          razorpay.on('payment.failed', function(response: any) {
            console.error('Subscription payment failed:', response.error);
            
            const errorMessage = response.error.description || 'Subscription payment failed. Please try again.';
            
            toast({
              title: "Subscription Failed",
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
        amount: paymentAmount,
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
