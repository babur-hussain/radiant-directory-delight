
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAdminSubscriptionAssignment } from "@/hooks/useAdminSubscriptionAssignment";
import { User } from "@/types/auth";
import StatusBadge from "./StatusBadge";
import SubscriptionActionButton from "./SubscriptionActionButton";
import SubscriptionError from "./SubscriptionError";
import DebugInfo from "./DebugInfo";
import SubscriptionLoader from "./SubscriptionLoader";
import AdminWarning from "./AdminWarning";

interface UserSubscriptionAssignmentProps {
  user: User;
  onAssigned: (packageId: string) => void;
}

const UserSubscriptionAssignment: React.FC<UserSubscriptionAssignmentProps> = ({ 
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
    errorDetails,
    debugInfo,
    handleAssignPackage,
    handleCancelSubscription,
    currentUser
  } = useAdminSubscriptionAssignment(user, onAssigned);

  return (
    <div className="flex flex-col space-y-3">
      <SubscriptionError error={error || ""} errorDetails={errorDetails} />
      <DebugInfo info={debugInfo} />
      
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
      
      <SubscriptionLoader isLoading={isLoading} />
      
      <AdminWarning showWarning={!error && currentUser && !currentUser.isAdmin} />
    </div>
  );
};

export default UserSubscriptionAssignment;
