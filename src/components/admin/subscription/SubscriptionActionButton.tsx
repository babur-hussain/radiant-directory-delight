
import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

type SubscriptionActionButtonProps = {
  isActive: boolean;
  isLoading: boolean;
  selectedPackage: string;
  onAssign: () => void;
  onCancel: () => void;
};

const SubscriptionActionButton: React.FC<SubscriptionActionButtonProps> = ({
  isActive,
  isLoading,
  selectedPackage,
  onAssign,
  onCancel
}) => {
  if (isActive) {
    return (
      <Button 
        onClick={onCancel} 
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
    );
  }
  
  return (
    <Button 
      onClick={onAssign} 
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
  );
};

export default SubscriptionActionButton;
