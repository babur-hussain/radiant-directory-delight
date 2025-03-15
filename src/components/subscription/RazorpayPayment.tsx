
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

  useEffect(() => {
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
    script.onerror = () => {
      console.error("Failed to load Razorpay SDK");
      toast({
        title: "Payment Gateway Error",
        description: "Could not load payment gateway. Please try again later.",
        variant: "destructive"
      });
      onFailure(new Error("Failed to load Razorpay SDK"));
    };
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [toast, onFailure]);

  useEffect(() => {
    // Only initialize Razorpay when the script is loaded
    if (scriptLoaded && window.Razorpay) {
      initializeRazorpay();
    }
  }, [scriptLoaded]); // eslint-disable-line react-hooks/exhaustive-deps

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
      // Convert package price to paise (Razorpay uses smallest currency unit)
      const amountInPaise = Math.round(selectedPackage.price * 100);
      
      // Initial payment is the setup fee (minimum 100 paise = 1 INR if setupFee is 0)
      const initialPaymentInPaise = Math.max(Math.round(selectedPackage.setupFee * 100), 100);

      // Generate a unique order ID
      const orderId = `order_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

      const options = {
        key: "rzp_test_cNIFmAmiJ65uQS", // Replace with your actual Razorpay key
        amount: initialPaymentInPaise,
        currency: "INR",
        name: "Grow Bharat Vyapaar",
        description: `Setup fee for ${selectedPackage.title} package`,
        image: "https://your-company-logo.png", // Replace with your logo URL
        order_id: orderId, // This should ideally come from your backend
        prefill: {
          name: "",
          email: "",
          contact: ""
        },
        notes: {
          packageId: selectedPackage.id,
          packageName: selectedPackage.title,
          setupFee: selectedPackage.setupFee,
          annualSubscription: selectedPackage.price
        },
        theme: {
          color: "#3B82F6" // Blue color matching the UI
        },
        // Make these properties directly accessible
        handler: function(response: any) {
          console.log("Payment successful", response);
          // This function gets called after successful payment
          toast({
            title: "Payment Successful",
            description: `Your payment of ₹${selectedPackage.setupFee} was successful. Activating your subscription...`,
          });
          
          // Pass the payment response to the parent component
          onSuccess({
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id || orderId,
            razorpay_signature: response.razorpay_signature || 'test_signature',
            packageId: selectedPackage.id
          });
        },
        modal: {
          ondismiss: function() {
            console.log("Payment modal dismissed by user");
            toast({
              title: "Payment Cancelled",
              description: "You have cancelled the payment process. Your subscription was not activated.",
              variant: "destructive"
            });
            onFailure(new Error("Payment process cancelled by user"));
          },
          escape: true, // Allow escape key to dismiss the modal
          confirm_close: true, // Ask for confirmation before closing
          backdrop_close: false // Don't allow backdrop clicks to close the modal
        }
      };

      console.log("Opening Razorpay with options:", options);
      
      // Create a new instance of Razorpay
      const razorpay = new window.Razorpay(options);
      
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
      
      // Open the Razorpay checkout modal
      razorpay.open();
      console.log("Razorpay checkout modal opened");
      
    } catch (error) {
      console.error("Error opening Razorpay:", error);
      toast({
        title: "Payment Failed",
        description: "Could not initiate payment process. Please try again later.",
        variant: "destructive"
      });
      onFailure(error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-6">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="mt-4 text-center text-sm text-muted-foreground">
        {scriptLoaded ? "Initializing payment gateway..." : "Loading payment gateway..."}
      </p>
    </div>
  );
};

export default RazorpayPayment;
