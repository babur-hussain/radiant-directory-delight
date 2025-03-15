
import React from "react";
import { Loader2 } from "lucide-react";

interface SubscriptionLoaderProps {
  isLoading: boolean;
}

const SubscriptionLoader: React.FC<SubscriptionLoaderProps> = ({ isLoading }) => {
  if (!isLoading) return null;
  
  return (
    <div className="flex items-center justify-center p-4 min-h-[200px] w-full">
      <div className="flex flex-col items-center space-y-2">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading subscription data...</p>
      </div>
    </div>
  );
};

export default SubscriptionLoader;
