
import React, { useEffect, useState } from 'react';
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
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [sdkInitialized, setSdkInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [razorpayInstance, setRazorpayInstance] = useState<any>(null);

  // First stage: Load the script
  useEffect(() => {
    const loadScript = () => {
      // Check if script already exists
      const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
      
      if (existingScript) {
        console.log("Razorpay script already loaded");
        setScriptLoaded(true);
        return;
      }
      
      // Load Razorpay script dynamically
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => {
        console.log("Razorpay script loaded successfully");
        setScriptLoaded(true);
      };
      script.onerror = (error) => {
        console.error("Failed to load Razorpay SDK", error);
        toast({
          title: "Payment Gateway Error",
          description: "Could not load payment gateway. Please try again later.",
          variant: "destructive"
        });
        onFailure(new Error("Failed to load Razorpay SDK"));
      };
      document.body.appendChild(script);
    };

    // Delay script loading by a small amount to ensure DOM is ready
    const timer = setTimeout(() => {
      loadScript();
    }, 300);

    return () => {
      clearTimeout(timer);
      // Clean up script if component unmounts during loading
      const scriptTag = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
      if (scriptTag && scriptTag.parentNode) {
        scriptTag.parentNode.removeChild(scriptTag);
      }
    };
  }, [toast, onFailure]);

  // Second stage: Wait for script to load before initializing
  useEffect(() => {
    if (scriptLoaded) {
      // Make sure window.Razorpay is available
      if (typeof window.Razorpay !== 'undefined') {
        console.log("Razorpay object detected on window:", window.Razorpay);
        // Small delay to ensure script is fully initialized
        const timer = setTimeout(() => {
          setSdkInitialized(true);
          setIsLoading(false);
        }, 800); // Increased timeout to ensure full initialization
        
        return () => clearTimeout(timer);
      } else {
        console.error("Razorpay not found on window object despite script load");
        // Try again after a delay
        const retryTimer = setTimeout(() => {
          if (typeof window.Razorpay !== 'undefined') {
            console.log("Razorpay found on retry");
            setSdkInitialized(true);
            setIsLoading(false);
          } else {
            console.error("Razorpay still not available after retry");
            toast({
              title: "Payment Gateway Error",
              description: "Payment system not initialized properly. Please refresh and try again.",
              variant: "destructive"
            });
            onFailure(new Error("Razorpay object not available on window"));
          }
        }, 1500);
        
        return () => clearTimeout(retryTimer);
      }
    }
  }, [scriptLoaded, toast, onFailure]);

  // Final stage: Initialize Razorpay when everything is ready
  useEffect(() => {
    if (sdkInitialized && !isLoading && !razorpayInstance) {
      console.log("Preparing to initialize Razorpay");
      const timer = setTimeout(() => {
        initializeRazorpay();
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [sdkInitialized, isLoading, razorpayInstance]); // eslint-disable-line react-hooks/exhaustive-deps

  const initializeRazorpay = () => {
    if (!window.Razorpay) {
      console.error("Razorpay is not available on window object");
      toast({
        title: "Payment Gateway Error",
        description: "Could not initialize payment gateway. Please try again later.",
        variant: "destructive"
      });
      onFailure(new Error("Razorpay SDK is not available"));
      return;
    }

    try {
      console.log("Creating Razorpay options");
      
      // Handle setup fee - ensure it's at least 1 INR (100 paise)
      const setupFee = selectedPackage.setupFee || 0;
      // Convert package price to paise (Razorpay uses smallest currency unit)
      const amountInPaise = Math.round(selectedPackage.price * 100);
      
      // Initial payment is the setup fee (minimum 100 paise = 1 INR if setupFee is 0)
      const initialPaymentInPaise = Math.max(Math.round(setupFee * 100), 100);

      // Generate a unique order ID with timestamp and random number for increased uniqueness
      const orderId = `order_${Date.now()}_${Math.floor(Math.random() * 10000)}`;

      const options = {
        key: "rzp_test_cNIFmAmiJ65uQS", // Test mode key
        amount: initialPaymentInPaise,
        currency: "INR",
        name: "Grow Bharat Vyapaar",
        description: `Setup fee for ${selectedPackage.title} package`,
        image: "https://your-company-logo.png", // Replace with your logo URL
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
          color: "#3B82F6" // Blue color matching the UI
        },
        modal: {
          ondismiss: function() {
            console.log("Payment modal dismissed by user");
            toast({
              title: "Payment Cancelled",
              description: "You have cancelled the payment process. Your subscription was not activated.",
              variant: "warning"
            });
            onFailure(new Error("Payment process cancelled by user"));
          },
          escape: false, // Don't allow escape key to dismiss the modal
          confirm_close: true, // Ask for confirmation before closing
          backdrop_close: false, // Don't allow backdrop clicks to close the modal
          handleback: true, // Handle back button press
          animation: true // Enable animations
        },
        handler: function(response: any) {
          console.log("Payment successful", response);
          toast({
            title: "Payment Successful",
            description: `Your payment of ₹${setupFee} was successful. Activating your subscription...`,
            variant: "success"
          });
          
          // Pass the payment response to the parent component
          onSuccess({
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id || orderId,
            razorpay_signature: response.razorpay_signature || 'test_signature',
            packageId: selectedPackage.id
          });
        }
      };

      console.log("Opening Razorpay with options:", options);
      
      // Create a new instance of Razorpay
      const razorpay = new window.Razorpay(options);
      setRazorpayInstance(razorpay);
      
      // Register payment.failed event before opening
      razorpay.on('payment.failed', function(response: any) {
        console.error("Payment failed:", response.error);
        toast({
          title: "Payment Failed",
          description: response.error.description || "Your payment was not successful. Please try again.",
          variant: "destructive"
        });
        onFailure(response.error);
      });
      
      // Delay opening to ensure everything is properly initialized
      setTimeout(() => {
        try {
          // Open the Razorpay checkout modal
          razorpay.open();
          console.log("Razorpay checkout modal opened");
        } catch (error) {
          console.error("Error during razorpay.open():", error);
          toast({
            title: "Payment Error",
            description: "Could not open payment gateway. Please try again.",
            variant: "destructive"
          });
          onFailure(error);
        }
      }, 800);
      
    } catch (error) {
      console.error("Error creating Razorpay instance:", error);
      toast({
        title: "Payment Failed",
        description: "Could not initiate payment process. Please try again later.",
        variant: "destructive"
      });
      onFailure(error);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Clean up Razorpay instance if it exists
      if (razorpayInstance) {
        console.log("Cleaning up Razorpay instance");
        try {
          razorpayInstance.close();
        } catch (error) {
          console.error("Error closing Razorpay instance:", error);
        }
      }
    };
  }, [razorpayInstance]);

  return (
    <div className="flex flex-col items-center justify-center p-6">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="mt-4 text-center text-sm text-muted-foreground">
        {!scriptLoaded 
          ? "Loading payment gateway..." 
          : !sdkInitialized 
            ? "Initializing payment gateway..." 
            : "Opening payment gateway..."}
      </p>
      <p className="mt-2 text-center text-xs text-muted-foreground">
        Please wait while we connect to our secure payment system
      </p>
    </div>
  );
};

export default RazorpayPayment;
