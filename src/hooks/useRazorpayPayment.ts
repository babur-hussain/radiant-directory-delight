
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

// Define notes object types for type safety
interface OneTimeNotesObject {
  packageId: string;
  packageType: "one-time";
}

interface RecurringNotesObject {
  packageId: string;
  packageType: "recurring";
  billingCycle: string;
  setupFee: number;
  recurringAmount: number;
  advanceMonths: number;
  subscriptionId: string;
  isInitialPayment: string;
  isRecurring: string;
  nextBillingDate: string;
}

type NotesObject = OneTimeNotesObject | RecurringNotesObject;

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

      // Create a valid order ID
      const orderId = generateOrderId();
      
      // Convert amount to paise
      const amountInPaise = convertToPaise(totalPaymentAmount);
      
      console.log(`Setting up payment for ${selectedPackage.title} with amount ${totalPaymentAmount} (${amountInPaise} paise)`);
      
      // Create next billing date for recurring payments
      const startDate = new Date();
      if (advanceMonths > 0) {
        startDate.setMonth(startDate.getMonth() + advanceMonths);
      }
      
      // Create notes object that will store subscription details
      let notesObject: NotesObject;
      
      if (isOneTimePackage) {
        notesObject = {
          packageId: selectedPackage.id,
          packageType: "one-time"
        };
      } else {
        notesObject = {
          packageId: selectedPackage.id,
          packageType: "recurring",
          billingCycle: selectedPackage.billingCycle || "monthly",
          setupFee: setupFee,
          recurringAmount: recurringAmount,
          advanceMonths: advanceMonths,
          subscriptionId: `sub${Date.now()}`,
          isInitialPayment: "true",
          isRecurring: "true",
          nextBillingDate: startDate.toISOString()
        };
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
          // Add payment type to the response
          response.paymentType = isOneTimePackage ? "one-time" : "recurring";
          response.packageId = selectedPackage.id;
          response.packageName = selectedPackage.title;
          response.amount = totalPaymentAmount;
          
          // For recurring payments, add subscription details
          if (!isOneTimePackage) {
            response.setupFee = setupFee;
            response.recurringAmount = recurringAmount;
            response.advanceMonths = advanceMonths;
            response.billingCycle = selectedPackage.billingCycle || 'monthly';
            response.nextBillingDate = (notesObject as RecurringNotesObject).nextBillingDate;
            response.subscriptionId = (notesObject as RecurringNotesObject).subscriptionId;
          }
          
          console.log(`${isOneTimePackage ? "One-time" : "Subscription"} payment successful, response:`, response);
          
          // Show success toast
          toast({
            title: isOneTimePackage ? "Payment Successful" : "Subscription Initialized",
            description: isOneTimePackage
              ? `Your payment for ${selectedPackage.title} was successful.`
              : `Your subscription to ${selectedPackage.title} has been activated.`,
            variant: "default"
          });
          
          setIsLoading(false);
          onSuccess(response);
        },
        prefill: {
          name: user?.fullName || '',
          email: user?.email || '',
          contact: user?.phone || ''
        },
        notes: notesObject,
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
      
      // Add payment methods
      const paymentMethods = {
        netbanking: true,
        card: true,
        upi: true,
        wallet: true
      };
      
      Object.assign(options, { method: paymentMethods });
      
      // For recurring subscriptions, configure autopay
      if (!isOneTimePackage) {
        console.log("Setting up for recurring subscription");
        
        // We don't set recurring flag directly for initial payment
        // It will be handled by the backend in production
      }
      
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
