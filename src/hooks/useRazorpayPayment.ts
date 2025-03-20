
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { 
  loadRazorpayScript, 
  isRazorpayAvailable, 
  RAZORPAY_KEY_ID, 
  generateOrderId, 
  convertToPaise 
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
  const [isOffline, setIsOffline] = useState(false);
  
  // Check online status
  const checkOnlineStatus = () => {
    const online = typeof navigator !== 'undefined' ? navigator.onLine : true;
    setIsOffline(!online);
    return online;
  };

  const loadScript = async (): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Check if we're online
      if (!checkOnlineStatus()) {
        console.log("Device is offline, using offline payment flow");
        setIsLoading(false);
        return true;
      }
      
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
      // Check if we're online
      const online = checkOnlineStatus();
      
      // First ensure the script is loaded
      const scriptLoaded = await loadScript();
      if (!scriptLoaded) {
        throw new Error('Payment gateway could not be loaded');
      }
      
      if (!online) {
        console.log("Device is offline, using simulated payment flow");
        
        // Simulate a successful payment after a delay
        setTimeout(() => {
          const mockResponse = {
            razorpay_payment_id: `offline_pay_${Date.now()}`,
            razorpay_order_id: `offline_order_${Date.now()}`,
            razorpay_signature: 'offline_signature',
            paymentType: selectedPackage.paymentType || 'recurring'
          };
          
          setIsLoading(false);
          onSuccess(mockResponse);
        }, 2000);
        
        return;
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
      
      // Enhanced Razorpay configuration with simplified and effective options
      const options = {
        key: RAZORPAY_KEY_ID,
        amount: amountInPaise,
        currency: 'INR',
        name: 'Grow Bharat Vyapaar',
        description: `Payment for ${selectedPackage.title}`,
        image: 'https://growbharatvyapaar.com/logo.png', // Optional: Add your logo URL
        order_id: orderId,
        prefill: {
          name: user?.displayName || user?.name || 'Customer',
          email: user?.email || 'customer@example.com',
          contact: user?.phone || ''
        },
        notes: {
          package_id: selectedPackage.id,
          package_type: selectedPackage.type,
          payment_type: selectedPackage.paymentType || "recurring"
        },
        theme: {
          color: '#2563EB'
        },
        handler: function(response: any) {
          // Add payment type to the response
          response.paymentType = selectedPackage.paymentType || "recurring";
          
          console.log("Payment successful, Razorpay response:", response);
          
          // Show success toast
          toast({
            title: "Payment Successful",
            description: `Your payment for ${selectedPackage.title} was successful.`,
            variant: "default"
          });
          
          setIsLoading(false);
          onSuccess(response);
        },
        modal: {
          ondismiss: function() {
            console.log('Payment modal dismissed');
            setIsLoading(false);
            
            toast({
              title: "Payment Cancelled",
              description: "You've cancelled the payment process.",
              variant: "default"
            });
            
            onFailure({ message: "Payment cancelled by user" });
          },
          escape: true,
          confirm_close: true
        }
      };
      
      console.log("Opening Razorpay with options:", options);
      
      // Create a new Razorpay instance with the much simpler approach
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
    initiatePayment,
    isOffline
  };
};
