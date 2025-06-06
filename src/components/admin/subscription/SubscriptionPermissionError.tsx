
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, ShieldAlert, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SubscriptionPermissionErrorProps {
  error: any;
  onRetry?: () => void;
}

const SubscriptionPermissionError: React.FC<SubscriptionPermissionErrorProps> = ({ 
  error, 
  onRetry 
}) => {
  if (!error) return null;
  
  const errorMessage = error instanceof Error ? error.message : String(error);
  const isPermissionError = 
    errorMessage.includes('permission') || 
    errorMessage.includes('unauthorized') || 
    errorMessage.includes('access denied');
  
  return (
    <Alert variant="destructive" className="mb-6">
      {isPermissionError ? (
        <ShieldAlert className="h-5 w-5" />
      ) : (
        <AlertCircle className="h-5 w-5" />
      )}
      <AlertTitle className="text-base font-semibold">
        {isPermissionError ? 'Permission Error' : 'Subscription Error'}
      </AlertTitle>
      <AlertDescription className="text-sm mt-1">
        <p>{errorMessage}</p>
        
        {isPermissionError && (
          <p className="text-sm mt-2">
            You may not have the necessary permissions to manage subscription packages.
            Please contact your administrator for assistance.
          </p>
        )}
        
        {onRetry && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onRetry} 
            className="mt-2 flex items-center"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
};

export default SubscriptionPermissionError;
