
import React from 'react';
import SubscriptionPackageManagement from '../../components/admin/subscription/SubscriptionManagement';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

// Component to handle MongoDB connection status
const Dashboard = () => {
  const handlePermissionError = (error: any) => {
    console.error("Permission error:", error);
    // Handle the permission error appropriately
  };

  // Use local state to indicate MongoDB connection status
  const [isMongoDBError, setIsMongoDBError] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string>('');

  const handleConnectionError = (err: Error) => {
    console.error("MongoDB connection error:", err);
    setIsMongoDBError(true);
    setErrorMessage(err.message);
  };

  const handleRetryConnection = () => {
    // This will be implemented if needed to retry connection
    console.log("Retrying MongoDB connection...");
    // You could implement actual retry logic here if needed
  };

  return (
    <div>
      {isMongoDBError && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Database Connection Error</AlertTitle>
          <AlertDescription>
            {errorMessage || "Could not connect to MongoDB. Using local fallback data."}
          </AlertDescription>
        </Alert>
      )}
      
      <SubscriptionPackageManagement 
        onPermissionError={handlePermissionError} 
        dbInitialized={!isMongoDBError} 
        connectionStatus={isMongoDBError ? "offline" : "connected"} 
        onRetryConnection={handleRetryConnection}
      />
    </div>
  );
};

export default Dashboard;
