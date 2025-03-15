
import { useState, useEffect } from "react";
import { fetchSubscriptionPackages } from "@/lib/firebase-utils";
import { User } from "@/types/auth";
import { SubscriptionPackage } from "@/data/subscriptionData";
import { toast } from "@/hooks/use-toast";
import { adminAssignSubscription, adminCancelSubscription } from "@/lib/subscription";
import { useAuth } from "@/hooks/useAuth";

export const useSubscriptionAssignment = (
  user: User,
  onAssigned: (packageId: string) => void
) => {
  const [packages, setPackages] = useState<SubscriptionPackage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<string>("");
  const [userCurrentSubscription, setUserCurrentSubscription] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const { user: currentUser } = useAuth();

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

  // Handle package assignment
  const handleAssignPackage = async () => {
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
    setIsLoading(true);
    
    try {
      console.log(`🚀 Starting package assignment: ${selectedPackage} to user ${user.id}`);
      
      const packageDetails = packages.find(pkg => pkg.id === selectedPackage);
      
      if (!packageDetails) {
        throw new Error(`Selected package not found: ${selectedPackage}`);
      }

      // Use the admin function to assign subscription
      const success = await adminAssignSubscription(user.id, packageDetails);
      
      if (!success) {
        throw new Error("Failed to assign subscription: Operation returned false");
      }
      
      console.log("✅ Subscription assigned successfully");
      
      // Update local state with the new subscription data
      const subscriptionData = {
        packageId: packageDetails.id,
        packageName: packageDetails.title,
        status: "active",
        assignedBy: currentUser?.id || "admin",
        assignedAt: new Date().toISOString()
      };
      
      setUserCurrentSubscription(subscriptionData);
      
      toast({
        title: "Subscription Assigned",
        description: `Successfully assigned ${packageDetails.title} to ${user.name || user.email || 'user'}`
      });
      
      // Notify parent component
      onAssigned(packageDetails.id);
    } catch (error) {
      console.error("❌ Error assigning subscription:", error);
      let errorMessage = "Failed to assign subscription. Please try again.";
      
      if (error instanceof Error) {
        errorMessage = error.message || errorMessage;
      }
      
      setError(errorMessage);
      
      toast({
        title: "Assignment Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle subscription cancellation
  const handleCancelSubscription = async () => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "Missing user ID",
        variant: "destructive"
      });
      return;
    }
    
    // Find subscription ID, handling different object structures
    let subscriptionId: string | undefined;
    
    if (userCurrentSubscription?.id) {
      subscriptionId = userCurrentSubscription.id;
    } else if (user.subscription?.id) {
      subscriptionId = user.subscription.id;
    }
    
    if (!subscriptionId) {
      toast({
        title: "Error",
        description: "Missing subscription information",
        variant: "destructive"
      });
      return;
    }
    
    setError(null);
    setIsLoading(true);
    
    try {
      // Use admin function to cancel subscription
      const success = await adminCancelSubscription(user.id, subscriptionId);
      
      if (!success) {
        throw new Error("Failed to cancel subscription: Operation returned false");
      }
      
      console.log("✅ Subscription cancelled successfully");
      
      // Update local state
      setUserCurrentSubscription({
        ...userCurrentSubscription,
        status: "cancelled",
        cancelledAt: new Date().toISOString()
      });
      
      toast({
        title: "Subscription Cancelled",
        description: "Subscription has been cancelled successfully"
      });
      
      onAssigned("");
    } catch (error) {
      console.error("❌ Error cancelling subscription:", error);
      
      let errorMessage = "Failed to cancel subscription. Please try again.";
      if (error instanceof Error) {
        errorMessage = error.message || errorMessage;
      }
      
      setError(errorMessage);
      
      toast({
        title: "Cancellation Failed",
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
    handleAssignPackage,
    handleCancelSubscription
  };
};
