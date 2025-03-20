
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

// Define payment notes type for type safety
interface PaymentNotes {
  packageId: string;
  packageType: "one-time" | "recurring";
  [key: string]: string | number | boolean;
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
      
      // Generate an order ID
      const orderId = generateOrderId();
      
      // Convert amount to paise
      const amountInPaise = convertToPaise(initialAmount);
      
      console.log(`Setting up payment for ${selectedPackage.title} with amount ${initialAmount} (${amountInPaise} paise)`);
      
      // Create notes object with subscription details
      const notes: PaymentNotes = {
        packageId: selectedPackage.id,
        packageType: isOneTimePackage ? "one-time" : "recurring",
        packageName: selectedPackage.title
      };
      
      // Add subscription-specific details for recurring packages
      if (!isOneTimePackage) {
        const nextBillingDate = new Date();
        if (selectedPackage.advancePaymentMonths) {
          nextBillingDate.setMonth(nextBillingDate.getMonth() + (selectedPackage.advancePaymentMonths || 0));
        }
        
        Object.assign(notes, {
          billingCycle: selectedPackage.billingCycle || "monthly",
          setupFee: String(selectedPackage.setupFee || 0),
          recurringAmount: String(selectedPackage.price || 0),
          advanceMonths: String(selectedPackage.advancePaymentMonths || 0),
          nextBillingDate: nextBillingDate.toISOString(),
          isRecurring: "true"
        });
      }
      
      // Configure Razorpay options
      const options = {
        key: RAZORPAY_KEY_ID,
        amount: amountInPaise,
        currency: 'INR',
        name: 'Grow Bharat Vyapaar',
        description: `Payment for ${selectedPackage.title}`,
        image: 'https://example.com/your_logo.png',
        order_id: orderId,
        handler: function(response: any) {
          // Add package info to response
          const enrichedResponse = {
            ...response,
            packageId: selectedPackage.id,
            packageName: selectedPackage.title,
            amount: initialAmount,
            paymentType: isOneTimePackage ? "one-time" : "recurring"
          };
          
          // For recurring payments, add subscription details
          if (!isOneTimePackage) {
            Object.assign(enrichedResponse, {
              setupFee: selectedPackage.setupFee || 0,
              recurringAmount: selectedPackage.price || 0,
              advanceMonths: selectedPackage.advancePaymentMonths || 0,
              billingCycle: selectedPackage.billingCycle || 'monthly',
              nextBillingDate: notes.nextBillingDate
            });
          }
          
          console.log(`Payment successful for ${selectedPackage.title}:`, enrichedResponse);
          
          // Show success toast
          toast({
            title: isOneTimePackage ? "Payment Successful" : "Subscription Initialized",
            description: `Your payment for ${selectedPackage.title} was successful.`,
            variant: "default"
          });
          
          setIsLoading(false);
          onSuccess(enrichedResponse);
        },
        prefill: {
          name: user?.fullName || '',
          email: user?.email || '',
          contact: user?.phone || ''
        },
        notes: notes,
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
      
      // Log options for debugging
      console.log("Opening Razorpay with options:", {
        key: RAZORPAY_KEY_ID,
        amount: amountInPaise,
        packageId: selectedPackage.id,
        packageTitle: selectedPackage.title,
        isOneTime: isOneTimePackage,
        orderId
      });
      
      // Create and open Razorpay checkout
      const razorpay = new window.Razorpay(options);
      
      // Handle payment failures
      razorpay.on('payment.failed', function(resp: any) {
        console.error('Payment failed:', resp.error);
        
        const errorMessage = resp.error.description || 'Payment failed. Please try again.';
        
        toast({
          title: "Payment Failed",
          description: errorMessage,
          variant: "destructive"
        });
        
        setIsLoading(false);
        setError(errorMessage);
        onFailure(resp.error);
      });
      
      // Open the Razorpay checkout
      razorpay.open();
      
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
