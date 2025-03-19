
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SubscriptionLoaderProps {
  isLoading: boolean;
  connectionStatus?: 'connecting' | 'connected' | 'error' | 'offline';
  onRetry?: () => void;
}

const SubscriptionLoader: React.FC<SubscriptionLoaderProps> = ({ 
  isLoading, 
  connectionStatus, 
  onRetry 
}) => {
  if (!isLoading) return null;

  const isConnectionProblem = connectionStatus === 'error' || connectionStatus === 'offline';
  
  return (
    <div className="space-y-4 py-4">
      {isConnectionProblem && (
        <Alert variant={connectionStatus === 'offline' ? 'warning' : 'destructive'} className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>
            {connectionStatus === 'offline' ? 'Connection Offline' : 'Connection Error'}
          </AlertTitle>
          <AlertDescription className="flex flex-col gap-2">
            <p>
              {connectionStatus === 'offline' 
                ? 'Unable to connect to the server. Loading cached data.' 
                : 'Error connecting to the database. Using fallback data.'}
            </p>
            {onRetry && (
              <Button variant="outline" size="sm" className="w-fit" onClick={onRetry}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry Connection
              </Button>
            )}
          </AlertDescription>
        </Alert>
      )}
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array(3).fill(0).map((_, i) => (
          <div key={i} className="border rounded-lg p-4">
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-full mb-1" />
            <Skeleton className="h-4 w-2/3 mb-3" />
            <Skeleton className="h-5 w-1/3 mb-4" />
            <div className="pt-4 border-t">
              <div className="flex gap-2">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-8 w-16" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubscriptionLoader;
