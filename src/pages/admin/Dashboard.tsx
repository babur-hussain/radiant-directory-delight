
import React, { useEffect, useState } from 'react';
import SubscriptionPackageManagement from '../../components/admin/subscription/SubscriptionManagement';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, RefreshCw, Database, ServerOff } from 'lucide-react';
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
        // Use a short timeout to quickly determine server availability
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

    // Set a timeout to prevent indefinite loading if connection takes too long
    const timeoutId = setTimeout(() => {
      if (isInitializing) {
        setIsMongoDBError(true);
        setErrorMessage("Connection timeout. Using local fallback data.");
        setConnectionStatus('offline');
        setIsInitializing(false);
      }
    }, 5000); // 5 second timeout

    initMongoDB();

    return () => clearTimeout(timeoutId);
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
    <div className="space-y-4">
      {isInitializing ? (
        <Alert className="bg-blue-50 border-blue-200">
          <Database className="h-4 w-4 animate-pulse text-blue-500" />
          <AlertTitle>Connecting to Database</AlertTitle>
          <AlertDescription>
            Attempting to connect to MongoDB...
          </AlertDescription>
        </Alert>
      ) : isMongoDBError ? (
        <Alert variant="destructive">
          <ServerOff className="h-4 w-4" />
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
      ) : (
        <Alert className="bg-green-50 border-green-200">
          <Database className="h-4 w-4 text-green-500" />
          <AlertTitle>Connected to Database</AlertTitle>
          <AlertDescription>
            Successfully connected to MongoDB.
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
