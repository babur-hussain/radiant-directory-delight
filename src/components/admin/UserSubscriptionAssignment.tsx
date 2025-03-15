
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { fetchSubscriptionPackages } from "@/lib/firebase-utils";
import { toast } from "@/hooks/use-toast";
import { SubscriptionPackage } from "@/data/subscriptionData";
import { User } from "@/types/auth";
import { updateUserSubscription, getUserSubscription } from "@/lib/subscription";
import { Loader2 } from "lucide-react";

interface UserSubscriptionAssignmentProps {
  user: User;
  onAssigned: (packageId: string) => void;
}

const UserSubscriptionAssignment: React.FC<UserSubscriptionAssignmentProps> = ({ user, onAssigned }) => {
  const [packages, setPackages] = useState<SubscriptionPackage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<string>("");
  const [userCurrentSubscription, setUserCurrentSubscription] = useState<any>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load packages
        const allPackages = await fetchSubscriptionPackages();
        setPackages(allPackages);
        console.log(`📦 Loaded ${allPackages.length} subscription packages`);

        // Load user's current subscription if it exists
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
        }
      } catch (error) {
        console.error("❌ Error loading subscription data:", error);
        toast({
          title: "Error",
          description: "Failed to load subscription data",
          variant: "destructive"
        });
      }
    };

    loadData();
  }, [user?.id]);

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
      toast({
        title: "Error",
        description: "Invalid user data. Missing user ID.",
        variant: "destructive"
      });
      console.error("❌ Cannot assign package: User ID is missing", user);
      return;
    }

    setIsLoading(true);

    try {
      console.log(`🚀 Starting package assignment: ${selectedPackage} to user ${user.id}`);
      
      // Find the selected package
      const packageDetails = packages.find(pkg => pkg.id === selectedPackage);
      
      if (!packageDetails) {
        throw new Error(`Selected package not found: ${selectedPackage}`);
      }

      // Create subscription data
      const subscriptionData = {
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
      
      // Update the subscription in Firestore
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
        throw new Error("Failed to update subscription");
      }
    } catch (error) {
      console.error("❌ Error assigning subscription:", error);
      let errorMessage = "Failed to assign subscription. Please try again.";
      
      if (error instanceof Error) {
        errorMessage = error.message || errorMessage;
      }
      
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
    
    setIsLoading(true);
    try {
      if (!userCurrentSubscription) {
        throw new Error("No active subscription found");
      }
      
      const updatedSubscription = {
        ...userCurrentSubscription,
        status: "cancelled",
        cancelledAt: new Date().toISOString(),
        cancelledBy: "admin"
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
      if (error instanceof Error) {
        errorMessage = error.message || errorMessage;
      }
      
      toast({
        title: "Cancellation Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

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
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : "Cancel"}
          </Button>
        ) : (
          <Button 
            onClick={handleAssignPackage} 
            disabled={!selectedPackage || isLoading}
            size="sm"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Assigning...
              </>
            ) : "Assign"}
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
