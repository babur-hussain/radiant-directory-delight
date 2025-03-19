
import React, { useEffect, useState } from 'react';
import SubscriptionPackageManagement from '../../components/admin/subscription/SubscriptionManagement';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { autoInitMongoDB } from '@/utils/setupMongoDB';
import { Button } from '@/components/ui/button';

// Component to handle MongoDB connection status
const Dashboard = () => {
  // State for MongoDB connection status
  const [isMongoDBError, setIsMongoDBError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isInitializing, setIsInitializing] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'offline'>('connecting');

  // Initialize MongoDB connection on component mount
  useEffect(() => {
    const initMongoDB = async () => {
      try {
        setIsInitializing(true);
        const result = await autoInitMongoDB();
        if (!result) {
          setIsMongoDBError(true);
          setErrorMessage("Could not connect to MongoDB. Using local fallback data.");
          setConnectionStatus('offline');
        } else {
          setIsMongoDBError(false);
          setConnectionStatus('connected');
        }
      } catch (error) {
        console.error("MongoDB initialization error:", error);
        setIsMongoDBError(true);
        setErrorMessage(error instanceof Error ? error.message : String(error));
        setConnectionStatus('offline');
      } finally {
        setIsInitializing(false);
      }
    };

    initMongoDB();
  }, []);

  const handlePermissionError = (error: any) => {
    console.error("Permission error:", error);
    // Handle the permission error appropriately
  };

  const handleConnectionError = (err: Error) => {
    console.error("MongoDB connection error:", err);
    setIsMongoDBError(true);
    setErrorMessage(err.message);
    setConnectionStatus('offline');
  };

  const handleRetryConnection = async () => {
    console.log("Retrying MongoDB connection...");
    setIsInitializing(true);
    setConnectionStatus('connecting');
    
    try {
      const result = await autoInitMongoDB();
      if (!result) {
        setIsMongoDBError(true);
        setErrorMessage("Could not connect to MongoDB. Using local fallback data.");
        setConnectionStatus('offline');
      } else {
        setIsMongoDBError(false);
        setConnectionStatus('connected');
      }
    } catch (error) {
      console.error("MongoDB retry connection error:", error);
      setIsMongoDBError(true);
      setErrorMessage(error instanceof Error ? error.message : String(error));
      setConnectionStatus('offline');
    } finally {
      setIsInitializing(false);
    }
  };

  return (
    <div>
      {isMongoDBError && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Database Connection Error</AlertTitle>
          <AlertDescription className="flex flex-col gap-2">
            {errorMessage || "Could not connect to MongoDB. Using local fallback data."}
            <Button 
              variant="outline" 
              size="sm" 
              className="w-fit mt-2" 
              onClick={handleRetryConnection}
              disabled={isInitializing}
            >
              {isInitializing ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              {isInitializing ? "Connecting..." : "Retry Connection"}
            </Button>
          </AlertDescription>
        </Alert>
      )}
      
      <SubscriptionPackageManagement 
        onPermissionError={handlePermissionError} 
        dbInitialized={!isMongoDBError} 
        connectionStatus={connectionStatus} 
        onRetryConnection={handleRetryConnection}
      />
    </div>
  );
};

export default Dashboard;
