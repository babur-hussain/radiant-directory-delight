
import React, { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import StatusBadge from "./StatusBadge";
import SubscriptionActionButton from "./SubscriptionActionButton";
import SubscriptionLoader from "./SubscriptionLoader";
import { useAdminSubscriptionAssignment } from "@/hooks/useAdminSubscriptionAssignment";
import { User } from "@/types/auth";
import { fetchSubscriptionPackages } from "@/lib/firebase-utils";
import { SubscriptionPackage, getPackageById } from "@/data/subscriptionData";

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
  
  const {
    isLoading,
    userCurrentSubscription,
    error,
    handleAssignPackage,
    handleCancelSubscription
  } = useAdminSubscriptionAssignment(user, onAssigned);
  
  // Fetch available packages
  useEffect(() => {
    const loadPackages = async () => {
      setIsLoadingPackages(true);
      
      try {
        // Try to fetch from Firebase
        const fetchedPackages = await fetchSubscriptionPackages();
        
        if (fetchedPackages && fetchedPackages.length > 0) {
          // Only show packages matching the user's role if role is defined
          if (user.role) {
            const rolePackages = fetchedPackages.filter(pkg => 
              pkg.type === user.role
            );
            
            if (rolePackages.length > 0) {
              setPackages(rolePackages);
            } else {
              throw new Error("No packages available for this user's role");
            }
          } else {
            setPackages(fetchedPackages);
          }
        } else {
          throw new Error("No packages available");
        }
      } catch (err) {
        console.error("Error loading packages:", err);
        setPackageError("Failed to load subscription packages");
        
        // Set default packages based on user role as fallback
        if (user.role === "Business" || user.role === "Influencer") {
          const defaultPackages = require("@/data/subscriptionData");
          const rolePackages = user.role === "Business" 
            ? defaultPackages.businessPackages 
            : defaultPackages.influencerPackages;
          
          setPackages(rolePackages);
        }
      } finally {
        setIsLoadingPackages(false);
      }
    };
    
    loadPackages();
  }, [user.role]);
  
  // Auto-select the user's current package if they have one
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
    return <SubscriptionLoader message="Loading subscription packages..." />;
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
  
  return (
    <div className="flex flex-col space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Subscription Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
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
                  {pkg.title} (₹{pkg.price})
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
            showCancel={true}
            isAdmin={true}
          />
        </div>
      </div>
      
      {userCurrentSubscription && (
        <div className="text-sm space-y-2 border-t pt-2 mt-2">
          <div className="flex justify-between items-center">
            <div>
              <span className="font-medium">Current Subscription: </span>
              <StatusBadge 
                status={userCurrentSubscription.status} 
                packageName={userCurrentSubscription.packageName} 
              />
            </div>
          </div>
          <p className="text-muted-foreground">
            Users cannot modify or cancel their subscriptions. Only admins can manage subscriptions.
          </p>
        </div>
      )}
    </div>
  );
};

export default UserSubscriptionAssignment;
