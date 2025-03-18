
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { loadRazorpayScript, isRazorpayAvailable, RAZORPAY_KEY_ID } from '@/utils/razorpay';
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
      
      // Create a mock order for demonstration
      // In a real app, this would come from your backend API
      const order = {
        id: `order_${Date.now()}`,
        amount: paymentAmount * 100, // Amount in smallest currency unit (paise)
        currency: 'INR',
        receipt: `receipt_${Date.now()}`
      };
      
      const options = {
        key: RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'Grow Bharat Vyapaar',
        description: `Payment for ${selectedPackage.title}`,
        order_id: order.id,
        handler: function(response: any) {
          // Add payment type to the response
          response.paymentType = selectedPackage.paymentType || "recurring";
          
          // Show success toast
          toast({
            title: "Payment Successful",
            description: `Your payment for ${selectedPackage.title} was successful.`,
            variant: "default"
          });
          
          setIsLoading(false);
          onSuccess(response);
        },
        prefill: {
          name: user.displayName || user.name || '',
          email: user.email || '',
          contact: ''
        },
        notes: {
          package_id: selectedPackage.id,
          package_type: selectedPackage.type,
          payment_type: selectedPackage.paymentType || "recurring"
        },
        theme: {
          color: '#2563EB'
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
          }
        }
      };
      
      const razorpay = new window.Razorpay(options);
      razorpay.open();
      
      // Log for debugging
      console.log("Opening Razorpay with options:", {
        packageId: selectedPackage.id,
        packageTitle: selectedPackage.title,
        amount: paymentAmount,
        orderId: order.id
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
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    initiatePayment
  };
};
