
import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface SubscriptionActionButtonProps {
  isActive: boolean;
  isLoading: boolean;
  selectedPackage: string;
  onAssign: () => void;
  onCancel: () => void;
  showCancel?: boolean;
  isAdmin?: boolean;
}

const SubscriptionActionButton: React.FC<SubscriptionActionButtonProps> = ({
  isActive,
  isLoading,
  selectedPackage,
  onAssign,
  onCancel,
  showCancel = true,
  isAdmin = false
}) => {
  if (!isAdmin) {
    return (
      <div className="flex w-full items-center justify-center">
        <Button variant="outline" disabled className="w-full text-sm">
          Only admins can manage subscriptions
        </Button>
      </div>
    );
  }
  
  if (isLoading) {
    return (
      <Button disabled className="w-full">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Processing
      </Button>
    );
  }

  if (isActive) {
    return (
      <div className="flex space-x-2">
        {showCancel && (
          <Button 
            variant="destructive" 
            onClick={onCancel}
            disabled={!isAdmin}
          >
            Cancel Subscription
          </Button>
        )}
      </div>
    );
  }

  return (
    <Button 
      onClick={onAssign} 
      disabled={!selectedPackage || !isAdmin} 
      className="w-full"
    >
      Assign Subscription
    </Button>
  );
};

export default SubscriptionActionButton;
