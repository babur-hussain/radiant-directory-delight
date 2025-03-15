
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAdminRazorpaySubscription } from "@/hooks/useAdminRazorpaySubscription";
import { User } from "@/types/auth";
import StatusBadge from "./StatusBadge";
import SubscriptionActionButton from "./SubscriptionActionButton";
import SubscriptionError from "./SubscriptionError";
import DebugInfo from "./DebugInfo";
import SubscriptionLoader from "./SubscriptionLoader";
import AdminWarning from "./AdminWarning";
import AdvancedSubscriptionControls from "./AdvancedSubscriptionControls";
import AdvancedSubscriptionDetails from "./AdvancedSubscriptionDetails";
import AdvancedSubscriptionActions from "./AdvancedSubscriptionActions";

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
    advancePaymentMonths,
    setAdvancePaymentMonths,
    signupFee,
    setSignupFee,
    isPausable,
    setIsPausable,
    advancePaymentOptions,
    handleCreateSubscription,
    handlePauseSubscription,
    handleResumeSubscription,
    currentUser
  } = useAdminRazorpaySubscription(user, onAssigned);

  return (
    <div className="flex flex-col space-y-3">
      <SubscriptionError error={error || ""} errorDetails={errorDetails} />
      <DebugInfo info={debugInfo} />
      
      <div className="flex flex-col space-y-3">
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
        
        {/* Only show advanced controls if no subscription exists yet */}
        {!userCurrentSubscription && (
          <AdvancedSubscriptionControls
            advancePaymentMonths={advancePaymentMonths}
            setAdvancePaymentMonths={setAdvancePaymentMonths}
            signupFee={signupFee}
            setSignupFee={setSignupFee}
            isPausable={isPausable}
            setIsPausable={setIsPausable}
            advancePaymentOptions={advancePaymentOptions}
            isDisabled={isLoading}
          />
        )}
        
        <div className="flex items-center">
          <SubscriptionActionButton 
            isActive={userCurrentSubscription?.status === 'active'}
            isLoading={isLoading}
            selectedPackage={selectedPackage}
            onAssign={handleCreateSubscription}
            onCancel={() => {}}
            showCancel={false} // No cancellation option as per requirements
          />
        </div>
      </div>
      
      {userCurrentSubscription && (
        <div className="space-y-2">
          <div className="text-sm">
            <StatusBadge 
              status={userCurrentSubscription.status} 
              packageName={userCurrentSubscription.packageName} 
            />
          </div>
          
          <AdvancedSubscriptionDetails 
            subscription={userCurrentSubscription}
          />
          
          <AdvancedSubscriptionActions
            subscription={userCurrentSubscription}
            isLoading={isLoading}
            onPause={handlePauseSubscription}
            onResume={handleResumeSubscription}
          />
        </div>
      )}
      
      <SubscriptionLoader isLoading={isLoading} />
      
      <AdminWarning showWarning={!error && currentUser && !currentUser.isAdmin} />
    </div>
  );
};

export default UserSubscriptionAssignment;
