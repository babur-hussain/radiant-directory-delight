
import React from "react";
import { Loader2 } from "lucide-react";

type SubscriptionLoaderProps = {
  isLoading: boolean;
};

const SubscriptionLoader: React.FC<SubscriptionLoaderProps> = ({ isLoading }) => {
  if (!isLoading) return null;
  
  return (
    <div className="text-xs text-muted-foreground italic mt-2">
      <Loader2 className="inline-block h-3 w-3 animate-spin mr-1" />
      Processing subscription update, this may take a moment...
    </div>
  );
};

export default SubscriptionLoader;
