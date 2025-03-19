
import React from "react";
import { Loader2, ServerOff, Database, AlertCircle } from "lucide-react";

interface SubscriptionLoaderProps {
  isLoading: boolean;
  connectionStatus?: 'connecting' | 'connected' | 'error' | 'offline';
}

const SubscriptionLoader: React.FC<SubscriptionLoaderProps> = ({ 
  isLoading, 
  connectionStatus = 'connecting' 
}) => {
  if (!isLoading) return null;
  
  return (
    <div className="flex items-center justify-center p-4 min-h-[200px] w-full">
      <div className="flex flex-col items-center space-y-2">
        {connectionStatus === 'offline' ? (
          <>
            <ServerOff className="h-8 w-8 text-gray-400" />
            <p className="text-sm text-muted-foreground">Loading offline subscription data...</p>
          </>
        ) : connectionStatus === 'error' ? (
          <>
            <AlertCircle className="h-8 w-8 text-red-500" />
            <p className="text-sm text-muted-foreground">Connection error, using fallback data...</p>
          </>
        ) : (
          <>
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading subscription data...</p>
          </>
        )}
      </div>
    </div>
  );
};

export default SubscriptionLoader;
