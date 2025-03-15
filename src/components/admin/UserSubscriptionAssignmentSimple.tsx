
import React, { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import StatusBadge from "./subscription/StatusBadge";
import SubscriptionActionButton from "./subscription/SubscriptionActionButton";
import { useSubscriptionAssignment } from "@/hooks/useSubscriptionAssignment";
import { User } from "@/types/auth";
import { getGlobalSubscriptionSettings } from "@/lib/subscription/subscription-settings";

interface UserSubscriptionAssignmentProps {
  user: User;
  onAssigned: (packageId: string) => void;
}

const UserSubscriptionAssignmentSimple: React.FC<UserSubscriptionAssignmentProps> = ({ 
  user, 
  onAssigned 
}) => {
  const {
    packages,
    isLoading,
    selectedPackage,
    setSelectedPackage,
    userCurrentSubscription,
    error,
    handleAssignPackage,
    handleCancelSubscription
  } = useSubscriptionAssignment(user, onAssigned);
  
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Check if current user is admin
  useEffect(() => {
    setIsAdmin(user?.isAdmin || user?.role === "Admin" || user?.role === "admin");
  }, [user]);
  
  // Apply global settings when assigning subscription
  const handleAssign = async () => {
    // Get global settings
    const globalSettings = await getGlobalSubscriptionSettings();
    console.log("Using global settings for subscription:", globalSettings);
    
    // Call the original assign function
    handleAssignPackage();
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
        
        <SubscriptionActionButton
          isActive={userCurrentSubscription?.status === 'active'}
          isLoading={isLoading}
          selectedPackage={selectedPackage}
          onAssign={handleAssign}
          onCancel={handleCancelSubscription}
          isAdmin={isAdmin}
        />
      </div>
      
      {userCurrentSubscription && (
        <div className="text-sm">
          <StatusBadge 
            status={userCurrentSubscription.status} 
            packageName={userCurrentSubscription.packageName} 
          />
          {!isAdmin && (
            <p className="text-xs text-muted-foreground mt-1">
              Only administrators can modify subscription details.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default UserSubscriptionAssignmentSimple;
