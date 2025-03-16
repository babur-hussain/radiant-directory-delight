// This file needs updating to include paymentType in subscription data
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { updateUserSubscription } from '@/lib/subscription';
import { adminAssignSubscription } from '@/lib/subscription/admin-subscription';
import { getGlobalSubscriptionSettings } from '@/lib/subscription/subscription-settings';
import { addNotification as createNotification } from '@/lib/notification'; // Renamed import to avoid conflict
import { useToast } from './use-toast';
import { SubscriptionData } from '@/lib/subscription/types';

export const useAdminSubscriptionAssignment = (userId: string, onSuccess?: (packageId: string) => void) => {
  const { user: adminUser } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [packages, setPackages] = useState<any[]>([]);
  const [selectedPackage, setSelectedPackage] = useState("");
  const [userCurrentSubscription, setUserCurrentSubscription] = useState<any>(null);
  
  const fetchUserSubscription = useCallback(async () => {
    try {
      // For the admin UI demo, we'll just check localStorage for existing subscriptions
      const userSubscriptions = JSON.parse(localStorage.getItem("userSubscriptions") || "{}");
      if (userSubscriptions[userId]) {
        setUserCurrentSubscription(userSubscriptions[userId]);
      }
    } catch (error) {
      console.error("Error fetching user subscription:", error);
    }
  }, [userId]);
  
  const fetchSubscriptionPackages = useCallback(async (userRole: string) => {
    try {
      // This would normally fetch packages from Firebase
      // For now, we're using a static import
      const packageData = await import('@/data/subscriptionData');
      let rolePkg = packageData.businessPackages;
      
      if (userRole === "Influencer") {
        rolePkg = packageData.influencerPackages;
      }
      
      setPackages(rolePkg);
      
      if (rolePkg.length > 0 && !selectedPackage) {
        setSelectedPackage(rolePkg[0].id);
      }
    } catch (error) {
      console.error("Error fetching packages:", error);
      setError("Failed to load subscription packages.");
    }
  }, [selectedPackage]);
  
  useEffect(() => {
    fetchUserSubscription();
  }, [fetchUserSubscription]);
  
  const handleAssignPackage = useCallback(async () => {
    if (!selectedPackage) {
      setError("Please select a package to assign");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      if (!adminUser || !adminUser.isAdmin) {
        throw new Error("Only administrators can assign subscriptions");
      }
      
      // Get the settings
      const settings = await getGlobalSubscriptionSettings();
      
      // Find the package details
      const packageData = packages.find(pkg => pkg.id === selectedPackage);
      
      if (!packageData) {
        throw new Error("Selected package not found");
      }
      
      // Check if this is a one-time package
      const isOneTimePackage = packageData.paymentType === "one-time";
      const paymentTypeValue = isOneTimePackage ? "one-time" as const : "recurring" as const;
      
      // Calculate end date (1 year from now or based on package duration)
      const endDate = new Date();
      if (packageData.durationMonths) {
        endDate.setMonth(endDate.getMonth() + packageData.durationMonths);
      } else {
        endDate.setFullYear(endDate.getFullYear() + 1);
      }
      
      // Create subscription data
      const subscriptionData: SubscriptionData = {
        userId: userId,
        packageId: packageData.id,
        packageName: packageData.title,
        amount: packageData.price,
        startDate: new Date().toISOString(),
        endDate: endDate.toISOString(),
        status: "active",
        assignedBy: adminUser.id,
        assignedAt: new Date().toISOString(),
        advancePaymentMonths: settings.defaultAdvancePaymentMonths,
        signupFee: packageData.setupFee || 0,
        actualStartDate: new Date().toISOString(),
        isPaused: false,
        isPausable: !isOneTimePackage, // One-time packages cannot be paused
        isUserCancellable: !isOneTimePackage, // One-time packages cannot be cancelled
        invoiceIds: [],
        paymentType: paymentTypeValue // Include payment type
      };
      
      // First try the admin assignment function
      let success = await adminAssignSubscription(userId, {
        ...packageData,
        ...subscriptionData
      });
      
      if (!success) {
        // Fallback to regular update function
        success = await updateUserSubscription(userId, subscriptionData);
      }
      
      if (success) {
        // Update localStorage for the demo
        const userSubscriptions = JSON.parse(localStorage.getItem("userSubscriptions") || "{}");
        userSubscriptions[userId] = {
          ...subscriptionData,
          id: `sub_${Date.now()}`
        };
        localStorage.setItem("userSubscriptions", JSON.stringify(userSubscriptions));
        
        setUserCurrentSubscription(subscriptionData);
        
        // Send notification to user (in a real app) - using renamed import
        await createNotification({
          userId: userId,
          title: "Subscription Assigned",
          message: `An administrator has assigned you the ${packageData.title} subscription.`,
          type: "subscription",
          read: false,
          createdAt: new Date().toISOString()
        });
        
        // Show success toast
        toast({
          title: "Subscription Assigned",
          description: `Successfully assigned ${packageData.title} to user.`,
        });
        
        // Call onSuccess callback if provided
        if (onSuccess) {
          onSuccess(packageData.id);
        }
      } else {
        throw new Error("Failed to assign subscription");
      }
    } catch (error) {
      console.error("Error assigning package:", error);
      setError(error instanceof Error ? error.message : "Failed to assign package");
      
      toast({
        title: "Assignment Failed",
        description: error instanceof Error ? error.message : "Failed to assign subscription package",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [adminUser, onSuccess, packages, selectedPackage, toast, userId]);
  
  const handleCancelSubscription = useCallback(async () => {
    if (!userCurrentSubscription) {
      setError("No active subscription to cancel");
      return;
    }
    
    // Check if this is a one-time package which cannot be cancelled
    if (userCurrentSubscription.paymentType === "one-time") {
      setError("One-time purchases cannot be cancelled");
      
      toast({
        title: "Cannot Cancel",
        description: "One-time purchases cannot be cancelled",
        variant: "destructive",
      });
      
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      if (!adminUser || !adminUser.isAdmin) {
        throw new Error("Only administrators can cancel subscriptions");
      }
      
      // Update the subscription status
      const updatedSubscription = {
        ...userCurrentSubscription,
        status: "cancelled",
        cancelledAt: new Date().toISOString(),
        cancelReason: "admin_cancelled"
      };
      
      const success = await updateUserSubscription(userId, updatedSubscription);
      
      if (success) {
        // Update localStorage for the demo
        const userSubscriptions = JSON.parse(localStorage.getItem("userSubscriptions") || "{}");
        if (userSubscriptions[userId]) {
          userSubscriptions[userId] = updatedSubscription;
          localStorage.setItem("userSubscriptions", JSON.stringify(userSubscriptions));
        }
        
        setUserCurrentSubscription(updatedSubscription);
        
        // Send notification to user (in a real app)
        await createNotification({
          userId: userId,
          title: "Subscription Cancelled",
          message: "An administrator has cancelled your subscription.",
          type: "subscription",
          read: false,
          createdAt: new Date().toISOString()
        });
        
        // Show success toast
        toast({
          title: "Subscription Cancelled",
          description: "Successfully cancelled the user's subscription.",
        });
      } else {
        throw new Error("Failed to cancel subscription");
      }
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      setError(error instanceof Error ? error.message : "Failed to cancel subscription");
      
      toast({
        title: "Cancellation Failed",
        description: error instanceof Error ? error.message : "Failed to cancel subscription",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [adminUser, toast, userId, userCurrentSubscription]);
  
  return {
    isLoading,
    error,
    packages,
    fetchPackages: useCallback(async (userRole: string) => {
      try {
        // This would normally fetch packages from Firebase
        // For now, we're using a static import
        const packageData = await import('@/data/subscriptionData');
        let rolePkg = packageData.businessPackages;
        
        if (userRole === "Influencer") {
          rolePkg = packageData.influencerPackages;
        }
        
        setPackages(rolePkg);
        
        if (rolePkg.length > 0 && !selectedPackage) {
          setSelectedPackage(rolePkg[0].id);
        }
      } catch (error) {
        console.error("Error fetching packages:", error);
        setError("Failed to load subscription packages.");
      }
    }, [selectedPackage]),
    selectedPackage,
    setSelectedPackage,
    userCurrentSubscription,
    handleAssignPackage,
    handleCancelSubscription: useCallback(async () => {
      // Placeholder implementation
      console.log("Cancel subscription requested");
      setIsLoading(true);
      
      try {
        // Implementation would go here
        setIsLoading(false);
        return true;
      } catch (error) {
        console.error("Error cancelling:", error);
        setIsLoading(false);
        return false;
      }
    }, [])
  };
};
