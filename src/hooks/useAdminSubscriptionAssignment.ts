
import { useState, useEffect } from "react";
import { fetchSubscriptionPackages } from "@/lib/firebase-utils";
import { toast } from "@/hooks/use-toast";
import { SubscriptionPackage } from "@/data/subscriptionData";
import { User } from "@/types/auth";
import { updateUserSubscription, getUserSubscription } from "@/lib/subscription";
import { useAuth } from "@/hooks/useAuth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/config/firebase";

export const useAdminSubscriptionAssignment = (
  user: User,
  onAssigned: (packageId: string) => void
) => {
  const [packages, setPackages] = useState<SubscriptionPackage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<string>("");
  const [userCurrentSubscription, setUserCurrentSubscription] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const { user: currentUser } = useAuth();
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  const [adminChecked, setAdminChecked] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const allPackages = await fetchSubscriptionPackages();
        setPackages(allPackages);
        console.log(`📦 Loaded ${allPackages.length} subscription packages`);

        if (user?.id) {
          console.log(`🔍 Checking subscription for user ${user.id}`);
          const subscription = await getUserSubscription(user.id);
          setUserCurrentSubscription(subscription);
          
          if (subscription?.packageId) {
            setSelectedPackage(subscription.packageId);
            console.log(`💡 User has existing subscription: ${subscription.packageId}`);
          } else {
            console.log("💡 User has no existing subscription");
          }
        } else {
          console.warn("⚠️ User object is missing ID:", user);
          setError("Invalid user data: Missing user ID");
        }

        // Validate that the current user has admin rights
        if (currentUser?.id) {
          try {
            const adminRef = doc(db, "users", currentUser.id);
            const adminDoc = await getDoc(adminRef);
            if (adminDoc.exists()) {
              const isAdmin = adminDoc.data()?.isAdmin === true;
              setAdminChecked(true);
              console.log(`🔐 Admin check: currentUser.id=${currentUser.id}, isAdmin=${isAdmin}`);
              if (!isAdmin) {
                setDebugInfo(`Warning: Your account (${currentUser.id}) does not have admin privileges in Firestore.`);
              }
            } else {
              console.warn("⚠️ Admin document not found");
              setDebugInfo(`Warning: Your account (${currentUser.id}) document was not found in Firestore.`);
            }
          } catch (adminError) {
            console.error("❌ Error checking admin status:", adminError);
          }
        }
      } catch (error) {
        console.error("❌ Error loading subscription data:", error);
        let errorMessage = "Failed to load subscription data";
        let details = "";
        
        if (error instanceof Error) {
          errorMessage = error.message || errorMessage;
          details = JSON.stringify(error, Object.getOwnPropertyNames(error));
        }
        
        setError(errorMessage);
        setErrorDetails(details);
        
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive"
        });
      }
    };

    loadData();

    if (currentUser) {
      const info = `Current admin: ${currentUser.id} (isAdmin: ${currentUser.isAdmin ? 'true' : 'false'})`;
      setDebugInfo(info);
      console.log(`🔐 ${info}`);
    } else {
      setDebugInfo("No authenticated user found. Authentication may be required.");
      console.log("⚠️ No authenticated user found");
    }
  }, [user?.id, currentUser]);

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
      console.error("❌ Cannot assign package: User ID is missing", user);
      return;
    }

    setError(null);
    setErrorDetails(null);
    setIsLoading(true);
    
    try {
      console.log(`🚀 Starting package assignment: ${selectedPackage} to user ${user.id}`);
      console.log(`🔑 Current user (admin) ID: ${currentUser?.id}`);
      
      const packageDetails = packages.find(pkg => pkg.id === selectedPackage);
      
      if (!packageDetails) {
        throw new Error(`Selected package not found: ${selectedPackage}`);
      }

      // Check Firestore permissions before attempting update
      if (currentUser) {
        try {
          // Verify admin status directly before proceeding
          const adminRef = doc(db, "users", currentUser.id);
          const adminDoc = await getDoc(adminRef);
          
          if (adminDoc.exists()) {
            const isAdmin = adminDoc.data()?.isAdmin === true;
            console.log(`🔐 Admin verification before update: ${isAdmin}`);
            if (!isAdmin) {
              console.warn(`⚠️ User ${currentUser.id} attempted to assign subscription without admin rights`);
            }
          }
        } catch (permError) {
          console.error("❌ Permission check error:", permError);
        }
      }

      const subscriptionData = {
        userId: user.id,
        packageId: packageDetails.id,
        packageName: packageDetails.title,
        amount: packageDetails.price,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + packageDetails.durationMonths * 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: "active",
        assignedBy: currentUser?.id || "admin",
        assignedAt: new Date().toISOString()
      };
      
      console.log("⚡ Creating subscription data:", subscriptionData);
      
      try {
        // Add additional debug info before calling updateUserSubscription
        console.log("Debug info before update:", {
          currentAdminId: currentUser?.id,
          isCurrentUserAdmin: currentUser?.isAdmin,
          targetUserId: user.id,
          adminCheckedStatus: adminChecked
        });
        
        const success = await updateUserSubscription(user.id, subscriptionData);
        
        if (success) {
          console.log("✅ Subscription assigned successfully");
          setUserCurrentSubscription(subscriptionData);
          
          toast({
            title: "Subscription Assigned",
            description: `Successfully assigned ${packageDetails.title} to ${user.name || user.email || 'user'}`
          });
          
          onAssigned(packageDetails.id);
        } else {
          // If updateUserSubscription returns false but doesn't throw
          throw new Error("Failed to update subscription: Returned false");
        }
      } catch (updateError) {
        console.error("❌ Error in updateUserSubscription:", updateError);
        throw updateError;
      }
    } catch (error) {
      console.error("❌ Error assigning subscription:", error);
      let errorMessage = "Failed to assign subscription. Please try again.";
      let details = "";
      
      if (error instanceof Error) {
        errorMessage = error.message || errorMessage;
        details = JSON.stringify(error, Object.getOwnPropertyNames(error));
        
        if (errorMessage.includes("permission-denied")) {
          errorMessage = "Permission denied. Please check your admin privileges and try again.";
        } else if (errorMessage.includes("not-found")) {
          errorMessage = "User document not found. Please refresh and try again.";
        } else if (errorMessage.includes("failed-precondition")) {
          errorMessage = "Operation failed. This might be due to a missing Firestore index. Check console for index creation link.";
        }
      }
      
      setError(errorMessage);
      setErrorDetails(details);
      
      toast({
        title: "Assignment Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "Invalid user data. Missing user ID.",
        variant: "destructive"
      });
      return;
    }
    
    setError(null);
    setErrorDetails(null);
    setIsLoading(true);
    
    try {
      if (!userCurrentSubscription) {
        throw new Error("No active subscription found");
      }
      
      const updatedSubscription = {
        ...userCurrentSubscription,
        status: "cancelled",
        cancelledAt: new Date().toISOString(),
        cancelledBy: currentUser?.id || "admin"
      };
      
      console.log("⚡ Cancelling subscription:", updatedSubscription);
      
      const success = await updateUserSubscription(user.id, updatedSubscription);
      
      if (success) {
        console.log("✅ Subscription cancelled successfully");
        setUserCurrentSubscription(updatedSubscription);
        
        toast({
          title: "Subscription Cancelled",
          description: "Subscription has been cancelled successfully"
        });
        
        onAssigned("");
      } else {
        throw new Error("Failed to cancel subscription");
      }
    } catch (error) {
      console.error("❌ Error cancelling subscription:", error);
      
      let errorMessage = "Failed to cancel subscription. Please try again.";
      let details = "";
      
      if (error instanceof Error) {
        errorMessage = error.message || errorMessage;
        details = JSON.stringify(error, Object.getOwnPropertyNames(error));
      }
      
      setError(errorMessage);
      setErrorDetails(details);
      
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
    errorDetails,
    debugInfo,
    adminChecked,
    handleAssignPackage,
    handleCancelSubscription,
    currentUser
  };
};
