
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { fetchSubscriptionPackages } from "@/lib/firebase-utils";
import { toast } from "@/hooks/use-toast";
import { SubscriptionPackage } from "@/data/subscriptionData";
import { User } from "@/types/auth";
import { syncUserData } from "@/features/auth/authStorage";
import { db } from "@/config/firebase";
import { doc, updateDoc, serverTimestamp, getDoc, setDoc } from "firebase/firestore";

interface UserSubscriptionAssignmentProps {
  user: User;
  onAssigned: (packageId: string) => void;
}

const UserSubscriptionAssignment: React.FC<UserSubscriptionAssignmentProps> = ({ user, onAssigned }) => {
  const [packages, setPackages] = useState<SubscriptionPackage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<string>("");
  const [userCurrentSubscription, setUserCurrentSubscription] = useState<any>(null);

  // Load subscription packages and current user subscription
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load subscription packages
        const allPackages = await fetchSubscriptionPackages();
        setPackages(allPackages);

        // Check Firestore first for user subscription
        try {
          const userDoc = doc(db, "users", user.id);
          const userSnapshot = await getDoc(userDoc);
          
          if (userSnapshot.exists()) {
            const userData = userSnapshot.data();
            // Check different possible subscription paths in the data
            if (userData?.subscription) {
              setUserCurrentSubscription(userData.subscription);
              if (userData.subscription.packageId) {
                setSelectedPackage(userData.subscription.packageId);
              }
              console.log("✅ Found subscription in Firestore:", userData.subscription);
              return;
            } else if (userData?.subscriptionPackage) {
              // Handle legacy format
              const basicSubscription = {
                packageId: userData.subscriptionPackage,
                status: userData.subscriptionStatus || 'active',
                startDate: userData.subscriptionAssignedAt || new Date().toISOString()
              };
              setUserCurrentSubscription(basicSubscription);
              setSelectedPackage(userData.subscriptionPackage);
              console.log("✅ Found legacy subscription in Firestore:", basicSubscription);
              return;
            }
          }
        } catch (firestoreError) {
          console.error("❌ Error fetching subscription from Firestore:", firestoreError);
        }

        // Fall back to localStorage if Firestore doesn't have the data
        const userSubscriptions = JSON.parse(localStorage.getItem("userSubscriptions") || "{}");
        const currentSubscription = userSubscriptions[user.id] || null;
        
        // Also check if the user has a subscription in their data
        const userSubscription = user.subscription || null;
        
        // Use Firebase data if available, otherwise use localStorage
        const effectiveSubscription = userSubscription || currentSubscription;
        
        setUserCurrentSubscription(effectiveSubscription);
        
        if (effectiveSubscription?.packageId) {
          setSelectedPackage(effectiveSubscription.packageId);
        }
      } catch (error) {
        console.error("Error loading subscription data:", error);
        toast({
          title: "Error",
          description: "Failed to load subscription data",
          variant: "destructive"
        });
      }
    };

    loadData();
  }, [user.id, user.subscription]);

  const handleAssignPackage = async () => {
    if (!selectedPackage) {
      toast({
        title: "Selection Required",
        description: "Please select a subscription package",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      // Find the selected package
      const packageDetails = packages.find(pkg => pkg.id === selectedPackage);
      
      if (!packageDetails) {
        throw new Error("Selected package not found");
      }

      // Create subscription data
      const subscriptionData = {
        id: `manual_${Date.now()}`,
        userId: user.id,
        packageId: packageDetails.id,
        packageName: packageDetails.title,
        amount: packageDetails.price,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + packageDetails.durationMonths * 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: "active",
        assignedBy: "admin",
        assignedAt: new Date().toISOString()
      };
      
      console.log("⚡ Creating subscription data:", subscriptionData);
      
      // Update in Firestore FIRST - using setDoc with merge to ensure reliable updates
      try {
        const userDoc = doc(db, "users", user.id);
        
        // First attempt: Use setDoc with merge to ensure full update works
        await setDoc(userDoc, {
          subscription: subscriptionData,
          subscriptionPackage: packageDetails.id,
          subscriptionStatus: "active",
          subscriptionAssignedAt: new Date().toISOString(),
          lastUpdated: serverTimestamp()
        }, { merge: true });
        
        console.log(`✅ Subscription assigned in Firestore: ${packageDetails.id} to ${user.id}`);
        
        // Verify update
        const updatedDoc = await getDoc(userDoc);
        if (updatedDoc.exists()) {
          const updated = updatedDoc.data();
          console.log("📊 Firestore after update:", {
            subscription: updated.subscription,
            subscriptionPackage: updated.subscriptionPackage,
            subscriptionStatus: updated.subscriptionStatus
          });
        }
      } catch (firestoreError) {
        console.error("❌ Failed to assign subscription in Firestore:", firestoreError);
        
        // Second attempt: Try updateDoc as fallback
        try {
          const userDoc = doc(db, "users", user.id);
          await updateDoc(userDoc, {
            "subscription": subscriptionData,
            "subscriptionPackage": packageDetails.id,
            "subscriptionStatus": "active",
            "subscriptionAssignedAt": new Date().toISOString(),
            "lastUpdated": serverTimestamp()
          });
          console.log("✅ Fallback update successful");
        } catch (fallbackError) {
          console.error("❌ Fallback update also failed:", fallbackError);
          // Continue with localStorage as last resort
        }
      }
      
      // Update localStorage as backup
      const userSubscriptions = JSON.parse(localStorage.getItem("userSubscriptions") || "{}");
      userSubscriptions[user.id] = subscriptionData;
      localStorage.setItem("userSubscriptions", JSON.stringify(userSubscriptions));
      
      // Also store subscription info in the user's local record to ensure persistence
      await syncUserData(user.id, {
        subscription: subscriptionData,
        subscriptionPackage: packageDetails.id,
        subscriptionStatus: "active",
        subscriptionAssignedAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      });
      
      // Update the current state
      setUserCurrentSubscription(subscriptionData);
      
      toast({
        title: "Subscription Assigned",
        description: `Successfully assigned ${packageDetails.title} to ${user.name || user.email}`
      });
      
      // Call the callback to notify parent component
      onAssigned(packageDetails.id);
    } catch (error) {
      console.error("Error assigning subscription:", error);
      toast({
        title: "Assignment Failed",
        description: "Failed to assign subscription",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    setIsLoading(true);
    try {
      if (!userCurrentSubscription) {
        throw new Error("No active subscription found");
      }
      
      // Update the subscription status to cancelled
      const updatedSubscription = {
        ...userCurrentSubscription,
        status: "cancelled",
        cancelledAt: new Date().toISOString(),
        cancelledBy: "admin"
      };
      
      console.log("⚡ Cancelling subscription:", updatedSubscription);
      
      // Update in Firestore FIRST - using setDoc with merge for reliability
      try {
        const userDoc = doc(db, "users", user.id);
        
        await setDoc(userDoc, {
          subscription: updatedSubscription,
          subscriptionStatus: "cancelled",
          subscriptionCancelledAt: new Date().toISOString(),
          lastUpdated: serverTimestamp()
        }, { merge: true });
        
        console.log(`✅ Subscription cancelled in Firestore for ${user.id}`);
        
        // Verify update
        const updatedDoc = await getDoc(userDoc);
        if (updatedDoc.exists()) {
          const updated = updatedDoc.data();
          console.log("📊 Firestore after cancellation:", {
            subscription: updated.subscription,
            subscriptionStatus: updated.subscriptionStatus
          });
        }
      } catch (firestoreError) {
        console.error("❌ Failed to cancel subscription in Firestore:", firestoreError);
        
        // Try updateDoc as fallback
        try {
          const userDoc = doc(db, "users", user.id);
          await updateDoc(userDoc, {
            "subscription": updatedSubscription,
            "subscriptionStatus": "cancelled",
            "subscriptionCancelledAt": new Date().toISOString(),
            "lastUpdated": serverTimestamp()
          });
          console.log("✅ Fallback cancellation successful");
        } catch (fallbackError) {
          console.error("❌ Fallback cancellation also failed:", fallbackError);
          // Continue with localStorage as last resort
        }
      }
      
      // Update localStorage as backup
      const userSubscriptions = JSON.parse(localStorage.getItem("userSubscriptions") || "{}");
      userSubscriptions[user.id] = updatedSubscription;
      localStorage.setItem("userSubscriptions", JSON.stringify(userSubscriptions));
      
      // Also update in the user's record
      await syncUserData(user.id, {
        subscription: updatedSubscription,
        subscriptionStatus: "cancelled",
        subscriptionCancelledAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      });
      
      // Update local state
      setUserCurrentSubscription(updatedSubscription);
      
      toast({
        title: "Subscription Cancelled",
        description: "Subscription has been cancelled successfully"
      });
      
      // Notify parent component
      onAssigned("");
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      toast({
        title: "Cancellation Failed",
        description: "Failed to cancel subscription",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to get subscription status color
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "active":
        return "text-green-800 bg-green-100";
      case "cancelled":
        return "text-red-800 bg-red-100";
      case "expired":
        return "text-orange-800 bg-orange-100";
      default:
        return "text-gray-800 bg-gray-100";
    }
  };

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex items-center gap-2">
        <Select
          value={selectedPackage}
          onValueChange={setSelectedPackage}
          disabled={isLoading}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a subscription package" />
          </SelectTrigger>
          <SelectContent>
            {packages.map(pkg => (
              <SelectItem key={pkg.id} value={pkg.id}>
                {pkg.title} (₹{pkg.price})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {userCurrentSubscription?.status === 'active' ? (
          <Button 
            onClick={handleCancelSubscription} 
            disabled={isLoading}
            variant="destructive"
            size="sm"
          >
            {isLoading ? "Processing..." : "Cancel"}
          </Button>
        ) : (
          <Button 
            onClick={handleAssignPackage} 
            disabled={!selectedPackage || isLoading}
            size="sm"
          >
            {isLoading ? "Assigning..." : "Assign"}
          </Button>
        )}
      </div>
      
      {userCurrentSubscription && (
        <div className="text-sm">
          <span className={`px-2 py-0.5 rounded-full ${getStatusBadgeClass(userCurrentSubscription.status)}`}>
            {userCurrentSubscription.packageName} ({userCurrentSubscription.status})
          </span>
        </div>
      )}
    </div>
  );
};

export default UserSubscriptionAssignment;
