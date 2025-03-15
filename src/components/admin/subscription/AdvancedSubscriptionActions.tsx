
import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Pause, Play } from "lucide-react";

type AdvancedSubscriptionActionsProps = {
  subscription: any;
  isLoading: boolean;
  onPause: () => void;
  onResume: () => void;
};

const AdvancedSubscriptionActions: React.FC<AdvancedSubscriptionActionsProps> = ({
  subscription,
  isLoading,
  onPause,
  onResume
}) => {
  if (!subscription || !subscription.isPausable) return null;

  if (subscription.isPaused) {
    return (
      <Button 
        onClick={onResume} 
        disabled={isLoading}
        variant="outline"
        size="sm"
        className="mt-2"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <Play className="mr-2 h-4 w-4" />
            Resume Subscription
          </>
        )}
      </Button>
    );
  }
  
  return (
    <Button 
      onClick={onPause} 
      disabled={isLoading}
      variant="outline"
      size="sm"
      className="mt-2"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          <Pause className="mr-2 h-4 w-4" />
          Pause Subscription
        </>
      )}
    </Button>
  );
};

export default AdvancedSubscriptionActions;
