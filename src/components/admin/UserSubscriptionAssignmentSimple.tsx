
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { fetchSubscriptionPackages } from "@/lib/firebase-utils";
import { toast } from "@/hooks/use-toast";
import { SubscriptionPackage } from "@/data/subscriptionData";
import { User } from "@/types/auth";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from "@/hooks/useAuth";
import { adminAssignSubscription, adminCancelSubscription } from "@/lib/subscription";

interface UserSubscriptionAssignmentProps {
  user: User;
  onAssigned: (packageId: string) => void;
}

const UserSubscriptionAssignmentSimple: React.FC<UserSubscriptionAssignmentProps> = ({ user, onAssigned }) => {
  const [packages, setPackages] = useState<SubscriptionPackage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<string>("");
  const [userCurrentSubscription, setUserCurrentSubscription] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const { user: currentUser } = useAuth();

  // Load packages and check user's current subscription
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load subscription packages
        const allPackages = await fetchSubscriptionPackages();
        setPackages(allPackages);
        console.log(`📦 Loaded ${allPackages.length} subscription packages`);

        // Check if user has an existing subscription (simplified)
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
      
      if (success) {
        console.log("✅ Subscription assigned successfully");
        
        // Update local state
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
        
        onAssigned(packageDetails.id);
      } else {
        throw new Error("Failed to assign subscription: Operation returned false");
      }
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
    if (!user?.id || !userCurrentSubscription?.id) {
      toast({
        title: "Error",
        description: "Missing subscription or user information",
        variant: "destructive"
      });
      return;
    }
    
    setError(null);
    setIsLoading(true);
    
    try {
      // Use admin function to cancel subscription
      const success = await adminCancelSubscription(user.id, userCurrentSubscription.id);
      
      if (success) {
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
      } else {
        throw new Error("Failed to cancel subscription: Operation returned false");
      }
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
    <div className="flex flex-col space-y-3">
      {error && (
        <Alert variant="destructive" className="mb-2">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Subscription Update Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
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

export default UserSubscriptionAssignmentSimple;
