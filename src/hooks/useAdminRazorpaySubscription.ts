
import { useState, useEffect } from "react";
import { fetchSubscriptionPackages } from "@/lib/firebase-utils";
import { User } from "@/types/auth";
import { SubscriptionPackage } from "@/data/subscriptionData";
import { toast } from "@/hooks/use-toast";
import { adminCreateRazorpaySubscription, adminPauseSubscription, adminResumeSubscription } from "@/lib/subscription/admin-razorpay-subscription";
import { useAuth } from "@/hooks/useAuth";
import { DEFAULT_ADVANCE_PAYMENT_OPTIONS, AdvancePaymentOption } from "@/lib/subscription/types";

export const useAdminRazorpaySubscription = (
  user: User,
  onAssigned: (packageId: string) => void
) => {
  const [packages, setPackages] = useState<SubscriptionPackage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<string>("");
  const [userCurrentSubscription, setUserCurrentSubscription] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const { user: currentUser } = useAuth();
  
  // Advanced payment settings
  const [advancePaymentMonths, setAdvancePaymentMonths] = useState<number>(6);
  const [signupFee, setSignupFee] = useState<number>(0);
  const [isPausable, setIsPausable] = useState<boolean>(false);
  const [advancePaymentOptions] = useState<AdvancePaymentOption[]>(DEFAULT_ADVANCE_PAYMENT_OPTIONS);

  // Load subscription packages and user's current subscription
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load subscription packages
        const allPackages = await fetchSubscriptionPackages();
        setPackages(allPackages);
        console.log(`📦 Loaded ${allPackages.length} subscription packages`);

        // Check if user has an existing subscription
        if (user?.subscription) {
          setUserCurrentSubscription(user.subscription);
          setSelectedPackage(user.subscription.packageId);
          console.log(`💡 User has existing subscription: ${user.subscription.packageId}`);
          
          // Set advanced payment options from existing subscription if available
          if (user.subscription.advancePaymentMonths) {
            setAdvancePaymentMonths(user.subscription.advancePaymentMonths);
          }
          
          if (user.subscription.signupFee) {
            setSignupFee(user.subscription.signupFee);
          }
          
          if (typeof user.subscription.isPausable !== 'undefined') {
            setIsPausable(user.subscription.isPausable);
          }
        } else {
          console.log("💡 User has no existing subscription");
        }
      } catch (error) {
        console.error("❌ Error loading data:", error);
        let errorMessage = "Failed to load subscription data";
        
        if (error instanceof Error) {
          errorMessage = error.message || errorMessage;
        }
        
        setError(errorMessage);
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive"
        });
      }
    };

    loadData();
  }, [user]);

  // Handle advanced subscription creation
  const handleCreateSubscription = async () => {
    if (!selectedPackage) {
      toast({
        title: "Selection Required",
        description: "Please select a subscription package",
        variant: "destructive"
      });
      return;
    }

    if (!user?.id) {
      const errorMsg = "Invalid user data. Missing user ID.";
      setError(errorMsg);
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive"
      });
      return;
    }

    setError(null);
    setDebugInfo(null);
    setErrorDetails(null);
    setIsLoading(true);
    
    try {
      console.log(`🚀 Starting advanced subscription creation: ${selectedPackage} for user ${user.id}`);
      setDebugInfo(`Creating advanced subscription with ${advancePaymentMonths} months advance payment`);
      
      const packageDetails = packages.find(pkg => pkg.id === selectedPackage);
      
      if (!packageDetails) {
        throw new Error(`Selected package not found: ${selectedPackage}`);
      }

      // Use the admin function to create subscription with advanced payment
      const success = await adminCreateRazorpaySubscription({
        userId: user.id,
        packageData: packageDetails,
        advancePaymentMonths: advancePaymentMonths,
        signupFee: signupFee,
        isPausable: isPausable,
        isUserCancellable: false, // Always false as per requirements
      });
      
      if (!success) {
        throw new Error("Failed to create subscription: Operation returned false");
      }
      
      console.log("✅ Advanced subscription created successfully");
      setDebugInfo("Advanced subscription created successfully");
      
      // Calculate actual start date
      const actualStartDate = new Date();
      actualStartDate.setMonth(actualStartDate.getMonth() + advancePaymentMonths);
      
      // Update local state with the new subscription data
      const subscriptionData = {
        packageId: packageDetails.id,
        packageName: packageDetails.title,
        status: "active",
        assignedBy: currentUser?.id || "admin",
        assignedAt: new Date().toISOString(),
        advancePaymentMonths: advancePaymentMonths,
        signupFee: signupFee,
        actualStartDate: actualStartDate.toISOString(),
        isPaused: false,
        isPausable: isPausable,
        isUserCancellable: false
      };
      
      setUserCurrentSubscription(subscriptionData);
      
      toast({
        title: "Subscription Created",
        description: `Successfully created ${packageDetails.title} subscription for ${user.name || user.email || 'user'} with ${advancePaymentMonths} months advance payment`
      });
      
      // Notify parent component
      onAssigned(packageDetails.id);
    } catch (error) {
      console.error("❌ Error creating subscription:", error);
      let errorMessage = "Failed to create subscription.";
      
      if (error instanceof Error) {
        errorMessage = error.message || errorMessage;
        setErrorDetails(error.stack || "No stack trace available");
      }
      
      setError(errorMessage);
      setDebugInfo("Subscription creation failed - see error details");
      
      toast({
        title: "Subscription Creation Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle subscription pausing
  const handlePauseSubscription = async () => {
    if (!user?.id || !userCurrentSubscription?.id) {
      toast({
        title: "Error",
        description: "Missing user ID or subscription ID",
        variant: "destructive"
      });
      return;
    }
    
    if (!userCurrentSubscription.isPausable) {
      toast({
        title: "Not Pausable",
        description: "This subscription cannot be paused",
        variant: "destructive"
      });
      return;
    }
    
    setError(null);
    setDebugInfo(null);
    setErrorDetails(null);
    setIsLoading(true);
    
    try {
      const adminId = currentUser?.id || "unknown";
      
      // Use admin function to pause subscription
      const success = await adminPauseSubscription(
        user.id, 
        userCurrentSubscription.id,
        adminId
      );
      
      if (!success) {
        throw new Error("Failed to pause subscription: Operation returned false");
      }
      
      console.log("✅ Subscription paused successfully");
      setDebugInfo("Subscription paused successfully");
      
      // Update local state
      setUserCurrentSubscription({
        ...userCurrentSubscription,
        isPaused: true,
        pausedAt: new Date().toISOString(),
        pausedBy: adminId,
        status: "paused"
      });
      
      toast({
        title: "Subscription Paused",
        description: "Subscription has been paused successfully"
      });
    } catch (error) {
      console.error("❌ Error pausing subscription:", error);
      
      let errorMessage = "Failed to pause subscription.";
      if (error instanceof Error) {
        errorMessage = error.message || errorMessage;
        setErrorDetails(error.stack || "No stack trace available");
      }
      
      setError(errorMessage);
      setDebugInfo("Subscription pause failed - see error details");
      
      toast({
        title: "Pause Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle subscription resuming
  const handleResumeSubscription = async () => {
    if (!user?.id || !userCurrentSubscription?.id) {
      toast({
        title: "Error",
        description: "Missing user ID or subscription ID",
        variant: "destructive"
      });
      return;
    }
    
    if (!userCurrentSubscription.isPaused) {
      toast({
        title: "Not Paused",
        description: "This subscription is not currently paused",
        variant: "destructive"
      });
      return;
    }
    
    setError(null);
    setDebugInfo(null);
    setErrorDetails(null);
    setIsLoading(true);
    
    try {
      const adminId = currentUser?.id || "unknown";
      
      // Use admin function to resume subscription
      const success = await adminResumeSubscription(
        user.id, 
        userCurrentSubscription.id,
        adminId
      );
      
      if (!success) {
        throw new Error("Failed to resume subscription: Operation returned false");
      }
      
      console.log("✅ Subscription resumed successfully");
      setDebugInfo("Subscription resumed successfully");
      
      // Update local state
      setUserCurrentSubscription({
        ...userCurrentSubscription,
        isPaused: false,
        resumedAt: new Date().toISOString(),
        resumedBy: adminId,
        status: "active"
      });
      
      toast({
        title: "Subscription Resumed",
        description: "Subscription has been resumed successfully"
      });
    } catch (error) {
      console.error("❌ Error resuming subscription:", error);
      
      let errorMessage = "Failed to resume subscription.";
      if (error instanceof Error) {
        errorMessage = error.message || errorMessage;
        setErrorDetails(error.stack || "No stack trace available");
      }
      
      setError(errorMessage);
      setDebugInfo("Subscription resume failed - see error details");
      
      toast({
        title: "Resume Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    packages,
    isLoading,
    selectedPackage,
    setSelectedPackage,
    userCurrentSubscription,
    error,
    errorDetails,
    debugInfo,
    advancePaymentMonths,
    setAdvancePaymentMonths,
    signupFee,
    setSignupFee,
    isPausable,
    setIsPausable,
    advancePaymentOptions,
    handleCreateSubscription,
    handlePauseSubscription,
    handleResumeSubscription,
    currentUser
  };
};
