
import React from "react";
import { Loader2, ServerOff, Database, AlertCircle, RefreshCw, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SubscriptionLoaderProps {
  isLoading: boolean;
  connectionStatus?: 'connecting' | 'connected' | 'error' | 'offline';
  onRetry?: () => void;
}

const SubscriptionLoader: React.FC<SubscriptionLoaderProps> = ({ 
  isLoading, 
  connectionStatus = 'connecting',
  onRetry
}) => {
  if (!isLoading) return null;
  
  return (
    <div className="flex items-center justify-center p-4 min-h-[200px] w-full">
      <div className="flex flex-col items-center space-y-4">
        {connectionStatus === 'offline' ? (
          <>
            <WifiOff className="h-8 w-8 text-amber-500" />
            <p className="text-sm text-muted-foreground">Database connection failed, using fallback data...</p>
            {onRetry && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onRetry} 
                className="mt-2 flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Database Connection
              </Button>
            )}
          </>
        ) : connectionStatus === 'error' ? (
          <>
            <AlertCircle className="h-8 w-8 text-red-500" />
            <p className="text-sm text-muted-foreground">Database connection error, please try again...</p>
            {onRetry && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onRetry} 
                className="mt-2 flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry Connection
              </Button>
            )}
          </>
        ) : connectionStatus === 'connecting' ? (
          <>
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Connecting to database server...</p>
          </>
        ) : (
          <>
            <Database className="h-8 w-8 text-green-500" />
            <p className="text-sm text-muted-foreground">Loading data from MongoDB...</p>
          </>
        )}
      </div>
    </div>
  );
};

export default SubscriptionLoader;
