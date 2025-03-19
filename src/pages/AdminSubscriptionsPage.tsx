
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import AdminLayout from '@/components/admin/AdminLayout';
import SubscriptionPackageManagement from '@/components/admin/subscription/SubscriptionManagement';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, RefreshCw, ServerOff, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { setupMongoDB } from '@/utils/setupMongoDB';
import { connectToMongoDB } from '@/config/mongodb';
import { testMongoDBConnection } from '@/api/mongoAPI';

const AdminSubscriptionsPage = () => {
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [dbInitialized, setDbInitialized] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'error' | 'offline'>('connecting');

  useEffect(() => {
    initializeDatabase();
  }, []);

  const initializeDatabase = async () => {
    setIsConnecting(true);
    setError(null);
    setConnectionStatus('connecting');
    
    try {
      console.log("Testing MongoDB connection availability...");
      // First check if the MongoDB server is even reachable
      const connectionTest = await testMongoDBConnection();
      
      if (!connectionTest || !connectionTest.success) {
        console.log("MongoDB server is not available:", connectionTest?.message || "Unknown error");
        setConnectionStatus('offline');
        setError("MongoDB server is not available. Operating in offline mode with limited functionality.");
        toast({
          title: "Database Offline",
          description: "MongoDB server is not available. Using fallback data.",
          variant: "destructive"
        });
        setIsConnecting(false);
        return;
      }
      
      console.log("MongoDB server is available, attempting connection...");
      const connected = await connectToMongoDB();
      
      if (!connected) {
        setError("Could not connect to MongoDB database");
        setConnectionStatus('error');
        toast({
          title: "Database Error",
          description: "Failed to connect to MongoDB. Using fallback data.",
          variant: "destructive"
        });
        setIsConnecting(false);
        return;
      }
      
      await setupMongoDB((progress, message) => {
        console.log(`MongoDB setup: ${progress}% - ${message}`);
      });
      
      setDbInitialized(true);
      setConnectionStatus('connected');
      
      toast({
        title: "Database Connected",
        description: "Successfully connected to MongoDB database.",
      });
    } catch (err) {
      console.error("Error initializing database:", err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(`Database initialization error: ${errorMessage}`);
      setConnectionStatus('error');
      
      toast({
        title: "Database Error",
        description: "Failed to initialize the subscription database. Using fallback data.",
        variant: "destructive"
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handlePermissionError = (error: any) => {
    const errorMessage = error instanceof Error ? error.message : String(error);
    setError(errorMessage);
    toast({
      title: "Permission Error",
      description: errorMessage,
      variant: "destructive"
    });
  };

  const handleRetry = () => {
    setError(null);
    setDbInitialized(false);
    initializeDatabase();
    toast({
      title: "Retrying Connection",
      description: "Attempting to reconnect to the subscription database...",
    });
  };

  const getConnectionStatusIcon = () => {
    switch (connectionStatus) {
      case 'connecting':
        return <RefreshCw className="h-5 w-5 animate-spin text-yellow-500" />;
      case 'connected':
        return <Database className="h-5 w-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'offline':
        return <ServerOff className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">Subscription Management</h1>
            <div className="flex items-center">
              {getConnectionStatusIcon()}
              <span className="ml-2 text-sm text-muted-foreground">
                {connectionStatus === 'connecting' && 'Connecting to database...'}
                {connectionStatus === 'connected' && 'Database connected'}
                {connectionStatus === 'error' && 'Database connection error'}
                {connectionStatus === 'offline' && 'Offline mode'}
              </span>
            </div>
          </div>
          
          {(error || !dbInitialized) && (
            <Button 
              variant="outline" 
              onClick={handleRetry}
              disabled={isConnecting}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isConnecting ? 'animate-spin' : ''}`} />
              {isConnecting ? 'Connecting...' : 'Retry Connection'}
            </Button>
          )}
        </div>
        
        {error && (
          <Alert variant={connectionStatus === 'offline' ? 'default' : 'destructive'}>
            {connectionStatus === 'offline' ? <ServerOff className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            <AlertTitle>{connectionStatus === 'offline' ? 'Offline Mode' : 'Error'}</AlertTitle>
            <AlertDescription>
              {error}
              {connectionStatus === 'offline' && (
                <div className="mt-2">
                  <p className="text-sm text-muted-foreground">
                    You can still view and modify subscription packages, but changes will only be stored locally until a connection is established.
                  </p>
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}
        
        <Card>
          <CardContent className="pt-6">
            <SubscriptionPackageManagement 
              onPermissionError={handlePermissionError} 
              dbInitialized={dbInitialized || connectionStatus === 'offline'}
              connectionStatus={connectionStatus}
            />
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminSubscriptionsPage;
