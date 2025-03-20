
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
            response.packageId = selectedPackage.id;
            response.packageName = selectedPackage.title;
            response.amount = selectedPackage.price || 0;
            
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
          // Simplified subscription flow - just collect setup fee first
          const options = {
            key: RAZORPAY_KEY_ID,
            amount: amountInPaise,
            currency: 'INR',
            name: 'Grow Bharat Vyapaar',
            description: `Setup fee for ${selectedPackage.title} subscription`,
            order_id: orderId,
            handler: function(response: any) {
              // Add subscription details to the response
              response.paymentType = "recurring";
              response.packageId = selectedPackage.id;
              response.packageName = selectedPackage.title;
              response.amount = selectedPackage.setupFee || 0;
              response.recurringAmount = selectedPackage.price || 0;
              response.billingCycle = selectedPackage.billingCycle || 'yearly';
              
              // Generate a mock subscription ID
              // In a real implementation, this would come from Razorpay's subscription API
              response.subscriptionId = `sub_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
              
              console.log("Subscription setup payment successful, response:", response);
              
              toast({
                title: "Subscription Initialized",
                description: `Your subscription to ${selectedPackage.title} has been activated. You will be charged ₹${selectedPackage.price} ${selectedPackage.billingCycle || 'yearly'}.`,
                variant: "default"
              });
              
              setIsLoading(false);
              onSuccess(response);
            }
          };
          
          console.log("Opening Razorpay subscription setup payment with options:", options);
          
          // Create a new Razorpay instance
          const razorpay = new window.Razorpay(options);
          
          // Handle payment failures
          razorpay.on('payment.failed', function(response: any) {
            console.error('Subscription setup payment failed:', response.error);
            
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
