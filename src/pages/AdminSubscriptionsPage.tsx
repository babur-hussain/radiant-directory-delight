
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import AdminLayout from '@/components/admin/AdminLayout';
import SubscriptionPackageManagement from '@/components/admin/subscription/SubscriptionManagement';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { setupMongoDB } from '@/utils/setupMongoDB';
import { connectToMongoDB } from '@/config/mongodb';

const AdminSubscriptionsPage = () => {
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [dbInitialized, setDbInitialized] = useState(false);

  useEffect(() => {
    initializeDatabase();
  }, []);

  const initializeDatabase = async () => {
    setIsConnecting(true);
    setError(null);
    
    try {
      console.log("Connecting to MongoDB...");
      const connected = await connectToMongoDB();
      
      if (!connected) {
        setError("Could not connect to MongoDB database");
        toast({
          title: "Database Error",
          description: "Failed to connect to MongoDB. Using fallback data.",
          variant: "destructive"
        });
        return;
      }
      
      await setupMongoDB((progress, message) => {
        console.log(`MongoDB setup: ${progress}% - ${message}`);
      });
      
      setDbInitialized(true);
      
      toast({
        title: "Database Connected",
        description: "Successfully connected to MongoDB database.",
      });
    } catch (err) {
      console.error("Error initializing database:", err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(`Database initialization error: ${errorMessage}`);
      
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

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Subscription Management</h1>
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
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <Card>
          <CardContent className="pt-6">
            <SubscriptionPackageManagement 
              onPermissionError={handlePermissionError} 
              dbInitialized={dbInitialized}
            />
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminSubscriptionsPage;
