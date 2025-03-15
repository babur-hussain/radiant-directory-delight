
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import StatusBadge from "./subscription/StatusBadge";
import SubscriptionActionButton from "./subscription/SubscriptionActionButton";
import { useSubscriptionAssignment } from "@/hooks/useSubscriptionAssignment";
import { User } from "@/types/auth";

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
          onAssign={handleAssignPackage}
          onCancel={handleCancelSubscription}
        />
      </div>
      
      {userCurrentSubscription && (
        <div className="text-sm">
          <StatusBadge 
            status={userCurrentSubscription.status} 
            packageName={userCurrentSubscription.packageName} 
          />
        </div>
      )}
    </div>
  );
};

export default UserSubscriptionAssignmentSimple;
