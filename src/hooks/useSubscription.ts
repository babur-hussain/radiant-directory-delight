
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getPackageById } from "@/data/subscriptionData";
import { toast } from "@/hooks/use-toast";

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id?: string;
  prefill: {
    name: string;
    email: string;
  };
  notes: {
    packageId: string;
  };
  theme: {
    color: string;
  };
  handler: (response: any) => void;
  modal: {
    ondismiss: () => void;
  };
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export const useSubscription = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { user } = useAuth();

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => {
        toast({
          title: "Payment Gateway Error",
          description: "Failed to load payment gateway. Please try again later.",
          variant: "destructive",
        });
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };

  const initiateSubscription = async (packageId: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to subscribe to a plan.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setIsProcessing(false);
        return;
      }

      // Get package details
      const selectedPackage = getPackageById(packageId);
      if (!selectedPackage) {
        toast({
          title: "Invalid Package",
          description: "The selected subscription package is invalid.",
          variant: "destructive",
        });
        setIsProcessing(false);
        return;
      }

      // First, handle the signup fee payment
      handleSignupFeePayment(selectedPackage);
    } catch (error) {
      console.error("Subscription error:", error);
      toast({
        title: "Subscription Error",
        description: "An error occurred while processing your request. Please try again.",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  const handleSignupFeePayment = (selectedPackage: any) => {
    // In a real implementation, you would call your backend to create an order
    // For demo purposes, we'll simulate the order creation
    
    const options: RazorpayOptions = {
      key: "rzp_live_8PGS0Ug3QeCb2I", // Razorpay Key ID
      amount: selectedPackage.setupFee * 100, // Amount in paise
      currency: "INR",
      name: "Influencer Platform",
      description: `Signup fee for ${selectedPackage.title}`,
      prefill: {
        name: user?.name || "",
        email: user?.email || "",
      },
      notes: {
        packageId: selectedPackage.id,
      },
      theme: {
        color: "#6366F1",
      },
      handler: function (response: any) {
        // After successful signup fee payment, set up the subscription
        handleSubscriptionSetup(selectedPackage, response.razorpay_payment_id);
      },
      modal: {
        ondismiss: function () {
          setIsProcessing(false);
          toast({
            title: "Payment Cancelled",
            description: "You cancelled the payment process.",
          });
        },
      },
    };

    const razorpayInstance = new window.Razorpay(options);
    razorpayInstance.open();
  };

  const handleSubscriptionSetup = (selectedPackage: any, signupPaymentId: string) => {
    // In a real implementation, you would call your backend to create a subscription
    // For demo purposes, we'll simulate the subscription creation
    
    const subscriptionOptions: RazorpayOptions = {
      key: "rzp_live_8PGS0Ug3QeCb2I", // Razorpay Key ID
      amount: selectedPackage.price * 100, // Amount in paise
      currency: "INR",
      name: "Influencer Platform",
      description: `Subscription to ${selectedPackage.title} (₹${selectedPackage.price}/year)`,
      prefill: {
        name: user?.name || "",
        email: user?.email || "",
      },
      notes: {
        packageId: selectedPackage.id,
        signupPaymentId: signupPaymentId,
      },
      theme: {
        color: "#6366F1",
      },
      handler: function (response: any) {
        // Process successful subscription setup
        processSuccessfulSubscription(selectedPackage, response.razorpay_payment_id);
      },
      modal: {
        ondismiss: function () {
          setIsProcessing(false);
          toast({
            title: "Subscription Setup Cancelled",
            description: "You cancelled the subscription setup process. Your signup fee has been processed, but the subscription was not set up.",
          });
        },
      },
    };

    const razorpayInstance = new window.Razorpay(subscriptionOptions);
    razorpayInstance.open();
  };

  const processSuccessfulSubscription = (selectedPackage: any, subscriptionPaymentId: string) => {
    // In a real implementation, you would call your backend to verify and store the subscription
    // For demo purposes, we'll simulate a successful subscription
    
    // Store subscription details locally (in a real app, this would be in the backend)
    const subscriptionData = {
      id: subscriptionPaymentId,
      userId: user?.id,
      packageId: selectedPackage.id,
      packageName: selectedPackage.title,
      amount: selectedPackage.price,
      startDate: new Date(),
      endDate: new Date(Date.now() + selectedPackage.durationMonths * 30 * 24 * 60 * 60 * 1000),
      status: "active",
    };

    // Store in localStorage for demo purposes
    const userSubscriptions = JSON.parse(localStorage.getItem("userSubscriptions") || "{}");
    userSubscriptions[user?.id as string] = subscriptionData;
    localStorage.setItem("userSubscriptions", JSON.stringify(userSubscriptions));

    setIsProcessing(false);
    
    toast({
      title: "Subscription Successful",
      description: `You have successfully subscribed to the ${selectedPackage.title} plan.`,
    });
    
    // Redirect to dashboard or subscription details page
    window.location.href = "/subscription/details";
  };

  const getUserSubscription = () => {
    if (!user) return null;
    
    // Get subscription from localStorage (in a real app, this would come from the backend)
    const userSubscriptions = JSON.parse(localStorage.getItem("userSubscriptions") || "{}");
    return userSubscriptions[user.id] || null;
  };

  const cancelSubscription = () => {
    if (!user) return;
    
    // In a real implementation, you would call your backend to cancel the subscription with Razorpay
    // For demo purposes, we'll just update the local storage
    
    const userSubscriptions = JSON.parse(localStorage.getItem("userSubscriptions") || "{}");
    if (userSubscriptions[user.id]) {
      userSubscriptions[user.id].status = "cancelled";
      localStorage.setItem("userSubscriptions", JSON.stringify(userSubscriptions));
      
      toast({
        title: "Subscription Cancelled",
        description: "Your subscription has been cancelled successfully.",
      });
    }
  };

  return {
    isProcessing,
    initiateSubscription,
    getUserSubscription,
    cancelSubscription
  };
};
