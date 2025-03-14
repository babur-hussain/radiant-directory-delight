import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getPackageById, businessPackages, influencerPackages } from "@/data/subscriptionData";
import { toast } from "@/hooks/use-toast";
import { fetchSubscriptionPackages } from "@/lib/firebase-utils";
import { SubscriptionPackage } from "@/data/subscriptionData";
import { syncUserData } from "@/features/auth/authStorage";

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
    [key: string]: string; // Allow additional properties in notes
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
  const [userSubscription, setUserSubscription] = useState<any>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const subscription = getUserSubscription();
      setUserSubscription(subscription);
    } else {
      setUserSubscription(null);
    }
  }, [user]);

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

  const getPackageDetails = async (packageId: string): Promise<SubscriptionPackage | null> => {
    try {
      const allPackages = await fetchSubscriptionPackages();
      const foundPackage = allPackages.find(pkg => pkg.id === packageId);
      
      if (foundPackage) {
        return foundPackage;
      }
      
      const localPackage = getPackageById(packageId);
      if (localPackage) {
        return localPackage;
      }
      
      throw new Error("Package not found");
    } catch (error) {
      console.error("Error fetching package details:", error);
      
      const localPackage = getPackageById(packageId);
      if (localPackage) {
        return localPackage;
      }
      
      return null;
    }
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
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setIsProcessing(false);
        return;
      }

      const selectedPackage = await getPackageDetails(packageId);
      if (!selectedPackage) {
        toast({
          title: "Invalid Package",
          description: "The selected subscription package is invalid.",
          variant: "destructive",
        });
        setIsProcessing(false);
        return;
      }

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
    const options: RazorpayOptions = {
      key: "rzp_live_8PGS0Ug3QeCb2I",
      amount: selectedPackage.setupFee * 100,
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
    const subscriptionOptions: RazorpayOptions = {
      key: "rzp_live_8PGS0Ug3QeCb2I",
      amount: selectedPackage.price * 100,
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

  const processSuccessfulSubscription = async (selectedPackage: any, subscriptionPaymentId: string) => {
    if (!user?.id) {
      setIsProcessing(false);
      toast({
        title: "Error",
        description: "User information is missing",
        variant: "destructive",
      });
      return;
    }
    
    const subscriptionData = {
      id: subscriptionPaymentId,
      userId: user.id,
      packageId: selectedPackage.id,
      packageName: selectedPackage.title,
      amount: selectedPackage.price,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + selectedPackage.durationMonths * 30 * 24 * 60 * 60 * 1000).toISOString(),
      status: "active",
      paymentMethod: "razorpay",
      paymentId: subscriptionPaymentId
    };

    try {
      const userSubscriptions = JSON.parse(localStorage.getItem("userSubscriptions") || "{}");
      userSubscriptions[user.id] = subscriptionData;
      localStorage.setItem("userSubscriptions", JSON.stringify(userSubscriptions));
      
      await syncUserData(user.id, {
        subscription: subscriptionData,
        lastUpdated: new Date().toISOString()
      });
      
      setUserSubscription(subscriptionData);
      setIsProcessing(false);
      
      toast({
        title: "Subscription Successful",
        description: `You have successfully subscribed to the ${selectedPackage.title} plan.`,
      });
      
      window.location.href = "/subscription/details";
    } catch (error) {
      console.error("Error saving subscription data:", error);
      toast({
        title: "Error",
        description: "Your payment was successful but we couldn't complete your subscription setup.",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  const getUserSubscription = () => {
    if (!user) return null;
    
    try {
      if (user.subscription) {
        console.log("Found subscription in user object:", user.subscription);
        return user.subscription;
      }
      
      const userSubscriptions = JSON.parse(localStorage.getItem("userSubscriptions") || "{}");
      const subscription = userSubscriptions[user.id] || null;
      
      if (subscription && user.id) {
        console.log("Found subscription in localStorage, syncing to user data:", subscription);
        
        syncUserData(user.id, {
          subscription: subscription,
          subscriptionPackage: subscription.packageId,
          subscriptionStatus: subscription.status,
          lastUpdated: new Date().toISOString()
        }).catch(err => console.error("Error syncing subscription to user data:", err));
      }
      
      return subscription;
    } catch (error) {
      console.error("Error getting user subscription:", error);
      return null;
    }
  };

  const cancelSubscription = async () => {
    if (!user) return;
    
    try {
      setIsProcessing(true);
      
      const currentSubscription = getUserSubscription();
      
      if (!currentSubscription) {
        toast({
          title: "No Active Subscription",
          description: "You don't have an active subscription to cancel.",
          variant: "destructive",
        });
        setIsProcessing(false);
        return;
      }
      
      const updatedSubscription = {
        ...currentSubscription,
        status: "cancelled",
        cancelledAt: new Date().toISOString()
      };
      
      const userSubscriptions = JSON.parse(localStorage.getItem("userSubscriptions") || "{}");
      userSubscriptions[user.id] = updatedSubscription;
      localStorage.setItem("userSubscriptions", JSON.stringify(userSubscriptions));
      
      await syncUserData(user.id, {
        subscription: updatedSubscription,
        lastUpdated: new Date().toISOString()
      });
      
      setUserSubscription(updatedSubscription);
      
      toast({
        title: "Subscription Cancelled",
        description: "Your subscription has been cancelled successfully.",
      });
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      toast({
        title: "Error",
        description: "Failed to cancel subscription.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isProcessing,
    userSubscription,
    initiateSubscription,
    getUserSubscription,
    cancelSubscription
  };
};
