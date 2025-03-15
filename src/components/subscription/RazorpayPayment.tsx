
import React, { useEffect, useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { SubscriptionPackage } from '@/data/subscriptionData';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface RazorpayPaymentProps {
  selectedPackage: SubscriptionPackage;
  onSuccess: (response: any) => void;
  onFailure: (error: any) => void;
}

const RazorpayPayment = ({ selectedPackage, onSuccess, onFailure }: RazorpayPaymentProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  
  // Load the Razorpay script
  useEffect(() => {
    console.log("Starting to load Razorpay script");
    
    // Check if script already exists
    const existingScript = document.getElementById('razorpay-checkout-js');
    
    if (existingScript) {
      console.log("Razorpay script already exists, using it");
      setScriptLoaded(true);
      return;
    }
    
    // Create and append the script
    const script = document.createElement('script');
    script.id = 'razorpay-checkout-js';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    
    script.onload = () => {
      console.log("Razorpay script loaded successfully");
      setScriptLoaded(true);
    };
    
    script.onerror = (error) => {
      console.error("Failed to load Razorpay script:", error);
      toast({
        title: "Payment Gateway Error",
        description: "Could not load payment gateway. Please try again later.",
        variant: "destructive"
      });
      onFailure(new Error("Failed to load Razorpay SDK"));
    };
    
    document.body.appendChild(script);
    
    // Cleanup function
    return () => {
      // Don't remove the script on unmount as it might be used by other components
    };
  }, [toast, onFailure]);
  
  // Initialize Razorpay when script is loaded
  const initializeRazorpay = useCallback(() => {
    if (!window.Razorpay) {
      console.error("Razorpay is not available");
      toast({
        title: "Payment Gateway Error",
        description: "Could not initialize payment gateway. Please try again later.",
        variant: "destructive"
      });
      onFailure(new Error("Razorpay SDK is not available"));
      return;
    }
    
    try {
      console.log("Creating Razorpay options with package:", selectedPackage.title);
      
      // Ensure we have a setup fee (default to 1 if not provided)
      const setupFee = selectedPackage.setupFee || 1;
      
      // Convert to paise (Razorpay uses smallest currency unit)
      // Ensure minimum payment is ₹1 (100 paise)
      const amountInPaise = Math.max(Math.round(setupFee * 100), 100);
      
      // Generate a unique order ID
      const orderId = `order_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
      
      // Configure Razorpay options
      const options = {
        key: "rzp_test_cNIFmAmiJ65uQS", // Test key
        amount: amountInPaise,
        currency: "INR",
        name: "Grow Bharat Vyapaar",
        description: `Setup fee for ${selectedPackage.title} package`,
        image: "https://example.com/your-logo.png", // Replace with actual logo
        order_id: orderId, // This should ideally come from your backend
        prefill: {
          name: "Customer Name",
          email: "customer@example.com",
          contact: "9800000000"
        },
        notes: {
          packageId: selectedPackage.id,
          packageName: selectedPackage.title,
          setupFee: setupFee,
          annualSubscription: selectedPackage.price
        },
        theme: {
          color: "#3B82F6" // Blue color
        },
        modal: {
          ondismiss: function() {
            console.log("Payment modal dismissed by user");
            toast({
              title: "Payment Cancelled",
              description: "You have cancelled the payment process.",
              variant: "warning"
            });
            onFailure(new Error("Payment process cancelled by user"));
          },
          escape: false,
          backdrop_close: false,
          confirm_close: true,
          animation: true,
          handleback: true
        },
        handler: function(response: any) {
          console.log("Payment success response:", response);
          toast({
            title: "Payment Successful",
            description: `Your payment of ₹${setupFee} was successful.`,
            variant: "success"
          });
          
          onSuccess({
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id || orderId,
            razorpay_signature: response.razorpay_signature || 'test_signature',
            packageId: selectedPackage.id
          });
        }
      };
      
      console.log("Initializing Razorpay with options:", options);
      
      // Create Razorpay instance
      const razorpay = new window.Razorpay(options);
      
      // Set up payment.failed event handler
      razorpay.on('payment.failed', function(response: any) {
        console.error("Payment failed response:", response.error);
        toast({
          title: "Payment Failed",
          description: response.error.description || "Your payment was not successful. Please try again.",
          variant: "destructive"
        });
        onFailure(response.error);
      });
      
      // Slight delay before opening
      setTimeout(() => {
        try {
          console.log("Opening Razorpay payment modal");
          razorpay.open();
        } catch (error) {
          console.error("Error opening Razorpay:", error);
          toast({
            title: "Payment Error",
            description: "Could not open payment gateway. Please try again.",
            variant: "destructive"
          });
          onFailure(error);
        }
      }, 500);
      
    } catch (error) {
      console.error("Error during Razorpay initialization:", error);
      toast({
        title: "Payment Failed",
        description: "Could not initiate payment process. Please try again later.",
        variant: "destructive"
      });
      onFailure(error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedPackage, toast, onSuccess, onFailure]);
  
  // Initialize Razorpay after script is loaded
  useEffect(() => {
    if (scriptLoaded) {
      console.log("Script loaded, waiting before initializing Razorpay");
      // Add a slight delay to ensure everything is ready
      const timer = setTimeout(() => {
        console.log("Now initializing Razorpay");
        initializeRazorpay();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [scriptLoaded, initializeRazorpay]);
  
  return (
    <div className="flex flex-col items-center justify-center p-6">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="mt-4 text-center text-sm text-muted-foreground">
        {!scriptLoaded 
          ? "Loading payment gateway..." 
          : "Preparing payment gateway..."}
      </p>
      <p className="mt-2 text-center text-xs text-muted-foreground">
        Please wait while we connect to our secure payment system
      </p>
    </div>
  );
};

export default RazorpayPayment;
