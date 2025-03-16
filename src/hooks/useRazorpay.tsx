
import { useState, useEffect, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { 
  loadRazorpayScript, 
  isRazorpayAvailable, 
  generateOrderId,
  convertToPaise
} from '@/utils/razorpay';
import { SubscriptionPackage } from '@/data/subscriptionData';

// Declare global Razorpay type
declare global {
  interface Window {
    Razorpay: any;
  }
}

interface UseRazorpayOptions {
  selectedPackage: SubscriptionPackage;
  onSuccess: (response: any) => void;
  onFailure: (error: any) => void;
}

export const useRazorpay = ({ selectedPackage, onSuccess, onFailure }: UseRazorpayOptions) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const razorpayInstanceRef = useRef<any>(null);
  
  // Load the Razorpay script
  useEffect(() => {
    let isMounted = true;
    setError(null);
    
    const loadScript = async () => {
      try {
        console.log("Starting to load Razorpay script");
        await loadRazorpayScript();
        if (isMounted) {
          console.log("Razorpay script loaded successfully, setting scriptLoaded to true");
          setScriptLoaded(true);
        }
      } catch (err) {
        if (isMounted) {
          console.error("Error loading Razorpay script:", err);
          setError("Could not load payment gateway. Please try again later.");
          toast({
            title: "Payment Gateway Error",
            description: "Could not load payment gateway. Please try again later.",
            variant: "destructive"
          });
          onFailure(new Error("Failed to load Razorpay SDK"));
        }
      }
    };
    
    loadScript();
    
    // Cleanup function
    return () => {
      isMounted = false;
      // Important: Do not remove the script on unmount, as this may cause issues
      // when the component is remounted
    };
  }, [toast, onFailure]);
  
  // Initialize Razorpay when script is loaded
  useEffect(() => {
    if (!scriptLoaded) return;
    
    let isMounted = true;
    let initTimeout: NodeJS.Timeout;
    
    const initializeRazorpayWithDelay = () => {
      // Add a short delay to ensure the Razorpay object is fully loaded
      initTimeout = setTimeout(() => {
        if (!isMounted) return;
        
        try {
          console.log("Checking if Razorpay is available in window object");
          if (!isRazorpayAvailable()) {
            console.error("Razorpay is not available in window object");
            setError("Payment gateway not initialized properly. Please refresh and try again.");
            onFailure(new Error("Razorpay SDK is not available"));
            return;
          }
          
          console.log("Creating Razorpay options with package:", selectedPackage.title);
          
          // Determine the payment amount based on the package type
          let paymentAmount = 0;
          const isOneTime = selectedPackage.paymentType === "one-time";
          
          if (isOneTime) {
            // For one-time payment, we charge the full price
            paymentAmount = selectedPackage.price;
            console.log(`One-time payment package with price: ${paymentAmount}`);
          } else {
            // For recurring, we use the setup fee
            paymentAmount = selectedPackage.setupFee && selectedPackage.setupFee > 0 
              ? selectedPackage.setupFee 
              : 1;
            console.log(`Recurring package with setup fee: ${paymentAmount}`);
          }
          
          // Convert to paise and ensure minimum payment
          const amountInPaise = convertToPaise(paymentAmount);
          
          // Generate a unique order ID
          const orderId = generateOrderId();
          
          // Configure Razorpay options
          const options = {
            key: "rzp_test_cNIFmAmiJ65uQS", // Test key
            amount: amountInPaise,
            currency: "INR",
            name: "Grow Bharat Vyapaar",
            description: isOneTime 
              ? `Full payment for ${selectedPackage.title} package` 
              : `Setup fee for ${selectedPackage.title} package`,
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
              paymentType: selectedPackage.paymentType || "recurring",
              price: selectedPackage.price,
              setupFee: selectedPackage.setupFee
            },
            theme: {
              color: "#3B82F6" // Blue color
            },
            handler: function(response: any) {
              console.log("Payment success response:", response);
              toast({
                title: "Payment Successful",
                description: isOneTime
                  ? `Your one-time payment of ₹${paymentAmount} was successful.`
                  : `Your payment of ₹${paymentAmount} was successful.`,
                variant: "success"
              });
              
              // Add payment type to the response
              onSuccess({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id || orderId,
                razorpay_signature: response.razorpay_signature || 'test_signature',
                packageId: selectedPackage.id,
                paymentType: selectedPackage.paymentType || "recurring"
              });
            }
          };
          
          console.log("Initializing Razorpay with options:", options);
          
          // Create Razorpay instance
          if (razorpayInstanceRef.current) {
            console.log("Closing existing Razorpay instance");
            try {
              razorpayInstanceRef.current.close();
            } catch (e) {
              console.warn("Error closing existing Razorpay instance:", e);
            }
          }
          
          razorpayInstanceRef.current = new window.Razorpay(options);
          
          // Set up payment.failed event handler
          razorpayInstanceRef.current.on('payment.failed', function(response: any) {
            console.error("Payment failed response:", response.error);
            setError("Payment failed. Please try again.");
            toast({
              title: "Payment Failed",
              description: response.error.description || "Your payment was not successful. Please try again.",
              variant: "destructive"
            });
            onFailure(response.error);
          });
          
          // Open Razorpay modal
          setTimeout(() => {
            if (!isMounted) return;
            
            try {
              console.log("Opening Razorpay payment modal");
              razorpayInstanceRef.current.open();
              setIsLoading(false);
            } catch (error) {
              console.error("Error opening Razorpay:", error);
              setError("Could not open payment gateway. Please try again.");
              toast({
                title: "Payment Error",
                description: "Could not open payment gateway. Please try again.",
                variant: "destructive"
              });
              onFailure(error);
              setIsLoading(false);
            }
          }, 1000); // Additional delay before opening
          
        } catch (error) {
          if (!isMounted) return;
          
          console.error("Error during Razorpay initialization:", error);
          setError("Could not initialize payment gateway. Please try again later.");
          toast({
            title: "Payment Failed",
            description: "Could not initiate payment process. Please try again later.",
            variant: "destructive"
          });
          onFailure(error);
          setIsLoading(false);
        }
      }, 1500); // Delay initialization to ensure Razorpay is ready
    };
    
    initializeRazorpayWithDelay();
    
    return () => {
      isMounted = false;
      clearTimeout(initTimeout);
      
      // Close Razorpay modal if it exists
      if (razorpayInstanceRef.current) {
        try {
          console.log("Closing Razorpay instance on cleanup");
          razorpayInstanceRef.current.close();
        } catch (e) {
          console.warn("Error closing Razorpay instance on cleanup:", e);
        }
      }
    };
  }, [scriptLoaded, selectedPackage, toast, onSuccess, onFailure]);
  
  return { isLoading, scriptLoaded, error };
};
