
import React, { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import StatusBadge from "./StatusBadge";
import SubscriptionActionButton from "./SubscriptionActionButton";
import SubscriptionLoader from "./SubscriptionLoader";
import { useAuth } from "@/hooks/useAuth";
import { User } from "@/types/auth";
import { fetchSubscriptionPackages } from "@/lib/firebase-utils";
import { SubscriptionPackage, getPackageById } from "@/data/subscriptionData";
import SubscriptionError from "./SubscriptionError";

interface UserSubscriptionAssignmentProps {
  user: User;
  onAssigned?: (packageId: string) => void;
}

const UserSubscriptionAssignment: React.FC<UserSubscriptionAssignmentProps> = ({ 
  user, 
  onAssigned 
}) => {
  const [packages, setPackages] = useState<SubscriptionPackage[]>([]);
  const [isLoadingPackages, setIsLoadingPackages] = useState(true);
  const [selectedPackage, setSelectedPackage] = useState("");
  const [packageError, setPackageError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const { user: currentUser } = useAuth();
  
  const [isLoading, setIsLoading] = useState(false);
  const [userCurrentSubscription, setUserCurrentSubscription] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  const handleAssignPackage = async (packageData: SubscriptionPackage) => {
    if (!packageData) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log(`Assigning package ${packageData.id} to user ${user.id}`);
      
      // Check if it's a one-time or recurring package
      const isOneTime = packageData.paymentType === "one-time";
      
      // For recurring, determine billing cycle
      const isMonthlyCycle = !isOneTime && packageData.billingCycle === "monthly";
      const packagePrice = isMonthlyCycle ? packageData.monthlyPrice || packageData.price / 12 : packageData.price;
      const durationMonths = isMonthlyCycle ? 1 : packageData.durationMonths;
      
      // Calculate end date based on duration
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + durationMonths);
      
      // Simulate subscription assignment
      const subscriptionData = {
        id: `sub_${Date.now()}`,
        userId: user.id,
        packageId: packageData.id,
        packageName: packageData.title,
        amount: packagePrice,
        status: "active",
        startDate: new Date().toISOString(),
        endDate: endDate.toISOString(),
        billingCycle: isOneTime ? undefined : (packageData.billingCycle || "yearly"),
        advancePaymentMonths: isOneTime ? 0 : (packageData.advancePaymentMonths || 0),
        paymentType: isOneTime ? "one-time" : "recurring"
      };
      
      // In a real app, we would save this to the database
      setUserCurrentSubscription(subscriptionData);
      
      // Notify parent component
      if (onAssigned) {
        onAssigned(packageData.id);
      }
      
      console.log("Subscription assigned successfully:", subscriptionData);
    } catch (err) {
      console.error("Error assigning subscription:", err);
      setError("Failed to assign subscription. Please try again.");
      setErrorDetails(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCancelSubscription = async () => {
    if (!userCurrentSubscription) return;
    
    // Check if this is a one-time package which cannot be cancelled
    if (userCurrentSubscription.paymentType === "one-time") {
      setError("One-time packages cannot be cancelled.");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log(`Cancelling subscription for user ${user.id}`);
      
      // Update the status to cancelled
      const updatedSubscription = {
        ...userCurrentSubscription,
        status: "cancelled",
        cancelledAt: new Date().toISOString()
      };
      
      // In a real app, we would update this in the database
      setUserCurrentSubscription(updatedSubscription);
      
      console.log("Subscription cancelled successfully");
    } catch (err) {
      console.error("Error cancelling subscription:", err);
      setError("Failed to cancel subscription. Please try again.");
      setErrorDetails(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    const loadPackages = async () => {
      setIsLoadingPackages(true);
      setPackageError(null);
      
      try {
        console.log("Fetching subscription packages for role:", user.role);
        const fetchedPackages = await fetchSubscriptionPackages();
        
        if (fetchedPackages && fetchedPackages.length > 0) {
          if (user.role) {
            const rolePackages = fetchedPackages.filter(pkg => 
              pkg.type === user.role
            );
            
            if (rolePackages.length > 0) {
              setPackages(rolePackages);
              console.log(`Found ${rolePackages.length} packages for role ${user.role}`);
            } else {
              console.warn("No packages found for user role:", user.role);
              throw new Error("No packages available for this user's role");
            }
          } else {
            setPackages(fetchedPackages);
            console.log(`Found ${fetchedPackages.length} packages`);
          }
        } else {
          console.warn("No packages returned from fetchSubscriptionPackages");
          throw new Error("No packages available");
        }
      } catch (err) {
        console.error("Error loading packages:", err);
        setPackageError("Failed to load subscription packages");
        setErrorDetails(err instanceof Error ? err.message : String(err));
        
        // Load fallback packages from local data
        if (user.role === "Business" || user.role === "Influencer") {
          const defaultPackages = require("@/data/subscriptionData");
          const rolePackages = user.role === "Business" 
            ? defaultPackages.businessPackages 
            : defaultPackages.influencerPackages;
          
          console.log(`Using ${rolePackages.length} fallback packages for role ${user.role}`);
          setPackages(rolePackages);
        }
      } finally {
        setIsLoadingPackages(false);
      }
    };
    
    loadPackages();
    
    // Also try to load the user's current subscription if available
    if (user.subscription) {
      setUserCurrentSubscription(user.subscription);
    }
  }, [user.role, user.subscription]);
  
  useEffect(() => {
    if (userCurrentSubscription && packages.length > 0) {
      setSelectedPackage(userCurrentSubscription.packageId);
    } else if (packages.length > 0) {
      setSelectedPackage(packages[0].id);
    }
  }, [userCurrentSubscription, packages]);
  
  const assignPackage = () => {
    if (!selectedPackage) return;
    
    const packageData = getPackageById(selectedPackage, packages);
    if (packageData) {
      handleAssignPackage(packageData);
    }
  };
  
  if (isLoadingPackages) {
    return <SubscriptionLoader isLoading={true} />;
  }
  
  if (packageError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{packageError}</AlertDescription>
      </Alert>
    );
  }
  
  // Find the currently selected package to check if it's one-time
  const currentlySelectedPackage = packages.find(pkg => pkg.id === selectedPackage);
  const isOneTimePackage = currentlySelectedPackage?.paymentType === "one-time";
  
  // Also check if current subscription is one-time
  const currentSubscriptionIsOneTime = userCurrentSubscription?.paymentType === "one-time";
  
  return (
    <div className="flex flex-col space-y-4">
      {error && (
        <SubscriptionError error={error} errorDetails={errorDetails} />
      )}
      
      <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
        <div className="w-full md:w-2/3">
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
                  {pkg.title} 
                  {pkg.paymentType === "one-time" 
                    ? ` (One-time ₹${pkg.price})` 
                    : pkg.billingCycle === "monthly" 
                      ? ` (₹${pkg.monthlyPrice}/month)` 
                      : ` (₹${pkg.price}/year)`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="w-full md:w-1/3">
          <SubscriptionActionButton
            isActive={userCurrentSubscription?.status === 'active'}
            isLoading={isLoading}
            selectedPackage={selectedPackage}
            onAssign={assignPackage}
            onCancel={handleCancelSubscription}
            showCancel={!isOneTimePackage}
            isAdmin={true}
          />
        </div>
      </div>
      
      {userCurrentSubscription && (
        <div className="text-sm space-y-2 border-t pt-2 mt-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="font-medium">Current Subscription: </span>
              <StatusBadge 
                status={userCurrentSubscription.status} 
                packageName={userCurrentSubscription.packageName} 
              />
              {currentSubscriptionIsOneTime && (
                <span className="bg-amber-100 text-amber-800 text-xs font-medium px-2 py-1 rounded">
                  One-time
                </span>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div>
              {!currentSubscriptionIsOneTime && (
                <>
                  <p className="text-xs text-muted-foreground">
                    Billing cycle: {userCurrentSubscription.billingCycle === "monthly" ? "Monthly" : "Yearly"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Advance payment: {userCurrentSubscription.advancePaymentMonths || 0} months
                  </p>
                </>
              )}
              {currentSubscriptionIsOneTime && (
                <p className="text-xs text-muted-foreground">
                  One-time payment: Valid until {new Date(userCurrentSubscription.endDate).toLocaleDateString()}
                </p>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Users cannot modify or cancel their subscriptions. Only admins can manage subscriptions.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserSubscriptionAssignment;
