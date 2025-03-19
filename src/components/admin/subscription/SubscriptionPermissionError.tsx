
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SubscriptionPermissionErrorProps {
  error: any;
  onRetry?: () => void;
}

const SubscriptionPermissionError: React.FC<SubscriptionPermissionErrorProps> = ({ 
  error, 
  onRetry 
}) => {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const isPermissionError = errorMessage.includes('Permission denied') || 
                           errorMessage.includes('insufficient permissions');
  
  return (
    <Alert variant="destructive" className="mb-6">
      {isPermissionError ? (
        <ShieldAlert className="h-5 w-5" />
      ) : (
        <AlertCircle className="h-5 w-5" />
      )}
      <AlertTitle className="text-base font-semibold">
        {isPermissionError ? 'Admin Permission Required' : 'Operation Failed'}
      </AlertTitle>
      <AlertDescription className="text-sm mt-1">
        <p>{errorMessage}</p>
        {onRetry && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onRetry} 
            className="mt-2"
          >
            Try Again
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
};

export default SubscriptionPermissionError;
