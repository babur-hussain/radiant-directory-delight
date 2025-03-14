
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { fetchSubscriptionPackages } from "@/lib/firebase-utils";
import { toast } from "@/hooks/use-toast";
import { SubscriptionPackage } from "@/data/subscriptionData";
import { User } from "@/types/auth";
import { syncUserData } from "@/features/auth/authStorage";

interface UserSubscriptionAssignmentProps {
  user: User;
  onAssigned: () => void;
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

        // Get current user subscription
        const userSubscriptions = JSON.parse(localStorage.getItem("userSubscriptions") || "{}");
        const currentSubscription = userSubscriptions[user.id] || null;
        setUserCurrentSubscription(currentSubscription);
        
        if (currentSubscription?.packageId) {
          setSelectedPackage(currentSubscription.packageId);
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
  }, [user.id]);

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
        startDate: new Date().toISOString(), // Store as ISO string for better persistence
        endDate: new Date(Date.now() + packageDetails.durationMonths * 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: "active",
        assignedBy: "admin", // Mark as assigned by admin
        assignedAt: new Date().toISOString()
      };
      
      // Update localStorage
      const userSubscriptions = JSON.parse(localStorage.getItem("userSubscriptions") || "{}");
      userSubscriptions[user.id] = subscriptionData;
      localStorage.setItem("userSubscriptions", JSON.stringify(userSubscriptions));
      
      // Also store subscription info in the user's record to ensure persistence
      await syncUserData(user.id, {
        subscription: subscriptionData,
        lastUpdated: new Date().toISOString()
      });
      
      // Update the current state
      setUserCurrentSubscription(subscriptionData);
      
      toast({
        title: "Subscription Assigned",
        description: `Successfully assigned ${packageDetails.title} to ${user.name || user.email}`
      });
      
      // Call the callback to notify parent component
      onAssigned();
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
      
      // Update localStorage
      const userSubscriptions = JSON.parse(localStorage.getItem("userSubscriptions") || "{}");
      userSubscriptions[user.id] = updatedSubscription;
      localStorage.setItem("userSubscriptions", JSON.stringify(userSubscriptions));
      
      // Also update in the user's record
      await syncUserData(user.id, {
        subscription: updatedSubscription,
        lastUpdated: new Date().toISOString()
      });
      
      // Update local state
      setUserCurrentSubscription(updatedSubscription);
      
      toast({
        title: "Subscription Cancelled",
        description: "Subscription has been cancelled successfully"
      });
      
      // Notify parent component
      onAssigned();
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
        <div className="text-sm text-muted-foreground">
          Current: {userCurrentSubscription.packageName} ({userCurrentSubscription.status})
        </div>
      )}
    </div>
  );
};

export default UserSubscriptionAssignment;
