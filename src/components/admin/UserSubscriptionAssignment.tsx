import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { fetchSubscriptionPackages } from "@/lib/firebase-utils";
import { toast } from "@/hooks/use-toast";
import { SubscriptionPackage } from "@/data/subscriptionData";
import { User } from "@/types/auth";
import { updateUserSubscription, getUserSubscription } from "@/lib/subscription";
import { Loader2, AlertCircle, ShieldAlert, ExternalLink, Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from "@/hooks/useAuth";

interface UserSubscriptionAssignmentProps {
  user: User;
  onAssigned: (packageId: string) => void;
}

const UserSubscriptionAssignment: React.FC<UserSubscriptionAssignmentProps> = ({ user, onAssigned }) => {
  const [packages, setPackages] = useState<SubscriptionPackage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<string>("");
  const [userCurrentSubscription, setUserCurrentSubscription] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const { user: currentUser } = useAuth();
  const [debugInfo, setDebugInfo] = useState<string | null>(null);

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
          throw new Error("Failed to update subscription: Unknown error occurred");
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
          <AlertDescription className="break-words max-w-full">
            {error}
            {error.includes("permission-denied") && (
              <div className="mt-2 flex items-center text-sm">
                <ShieldAlert className="h-4 w-4 mr-1" />
                <span>Check your admin permissions and Firestore rules.</span>
              </div>
            )}
            {errorDetails && (
              <div className="mt-2 p-2 bg-black/5 rounded-md text-xs font-mono overflow-auto max-h-32">
                <details>
                  <summary className="cursor-pointer">Technical details</summary>
                  <pre className="whitespace-pre-wrap">{errorDetails}</pre>
                </details>
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}
      
      {debugInfo && (
        <div className="text-xs text-muted-foreground mb-2 flex items-center">
          <Info className="h-3 w-3 mr-1" />
          <span>{debugInfo}</span>
        </div>
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
      
      {isLoading && (
        <div className="text-xs text-muted-foreground italic mt-2">
          <Loader2 className="inline-block h-3 w-3 animate-spin mr-1" />
          Processing subscription update, this may take a moment...
        </div>
      )}
      
      {!error && currentUser && !currentUser.isAdmin && (
        <Alert variant="warning" className="mt-2">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Admin Permission Required</AlertTitle>
          <AlertDescription>
            <div className="flex items-center">
              <ShieldAlert className="h-4 w-4 mr-1" />
              <span>You need admin privileges to manage subscriptions.</span>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default UserSubscriptionAssignment;
