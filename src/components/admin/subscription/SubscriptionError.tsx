
import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, ShieldAlert, Bug, Database } from "lucide-react";
import { Button } from "@/components/ui/button";

type SubscriptionErrorProps = {
  error: string;
  errorDetails?: string | null;
  onRetry?: () => void;
};

const SubscriptionError: React.FC<SubscriptionErrorProps> = ({ 
  error, 
  errorDetails,
  onRetry 
}) => {
  if (!error) return null;
  
  return (
    <Alert variant="destructive" className="mb-2">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Subscription Update Error</AlertTitle>
      <AlertDescription className="break-words max-w-full">
        {error}
        {error.includes("permission-denied") && (
          <div className="mt-2 flex items-center text-sm">
            <ShieldAlert className="h-4 w-4 mr-1" />
            <span>Check your admin permissions and Firestore rules.</span>
          </div>
        )}
        {error.includes("Unknown error") && (
          <div className="mt-2 flex items-center text-sm">
            <Bug className="h-4 w-4 mr-1" />
            <span>This may be a Firestore connectivity issue or permission problem.</span>
          </div>
        )}
        {error.includes("MongoDB") && (
          <div className="mt-2 flex items-center text-sm">
            <Database className="h-4 w-4 mr-1" />
            <span>MongoDB connection issue. This might be because browser-based connections to MongoDB are not supported without a backend service.</span>
          </div>
        )}
        {errorDetails && (
          <div className="mt-2 p-2 bg-black/5 rounded-md text-xs font-mono overflow-auto max-h-32">
            <details>
              <summary className="cursor-pointer">Technical details</summary>
              <pre className="whitespace-pre-wrap">{errorDetails}</pre>
            </details>
          </div>
        )}
        
        {onRetry && (
          <Button 
            onClick={onRetry} 
            variant="outline" 
            size="sm" 
            className="mt-2"
          >
            Retry Connection
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
};

export default SubscriptionError;
