
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { 
  loadRazorpayScript, 
  isRazorpayAvailable, 
  getRazorpayKey,
  generateOrderId, 
  generateReceiptId,
  convertToPaise,
  createRazorpayCheckout,
  formatNotesForRazorpay,
  RazorpayOptions,
  RazorpayResponse
} from '@/utils/razorpay';
import { ISubscriptionPackage } from '@/models/SubscriptionPackage';
import { useAuth } from '@/hooks/useAuth';

interface PaymentOptions {
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
      
      // Ensure minimum amount
      if (initialAmount < 1) {
        initialAmount = 1; // Minimum 1 rupee
      }
      
      // Generate a unique ID for this order
      const orderId = generateOrderId();
      console.log("Generated order ID:", orderId);
      
      // Generate a receipt ID
      const receiptId = generateReceiptId();
      
      // Convert amount to paise
      const amountInPaise = convertToPaise(initialAmount);
      
      console.log(`Setting up payment for ${selectedPackage.title} with amount ${initialAmount} (${amountInPaise} paise)`);
      
      // Create basic notes object (simple key-value pairs only)
      const notes: Record<string, string> = {
        packageId: selectedPackage.id,
        packageName: selectedPackage.title,
        amount: initialAmount.toString(),
        receiptId: receiptId,
        paymentType: isOneTimePackage ? "one-time" : "recurring"
      };
      
      // Configure Razorpay options
      const options: RazorpayOptions = {
        key: getRazorpayKey(),
        amount: amountInPaise,
        currency: 'INR',
        name: 'Grow Bharat Vyapaar',
        description: `Payment for ${selectedPackage.title}`,
        image: 'https://example.com/your_logo.png', // Replace with actual logo URL
        order_id: orderId,
        prefill: {
          name: user?.fullName || '',
          email: user?.email || '',
          contact: user?.phone || ''
        },
        notes: notes,
        theme: {
          color: '#3399cc'
        },
        handler: function(response: RazorpayResponse) {
          console.log(`Payment successful:`, response);
          
          toast({
            title: "Payment Successful",
            description: `Your payment for ${selectedPackage.title} was successful.`,
            variant: "default"
          });
          
          setIsLoading(false);
          
          try {
            onSuccess({
              ...response,
              packageId: selectedPackage.id,
              packageName: selectedPackage.title,
              amount: initialAmount,
              paymentType: isOneTimePackage ? "one-time" : "recurring",
              receiptId
            });
          } catch (callbackErr) {
            console.error("Error in onSuccess callback:", callbackErr);
          }
        },
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

      try {
        // Create Razorpay checkout
        const razorpay = createRazorpayCheckout(options);
        
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
