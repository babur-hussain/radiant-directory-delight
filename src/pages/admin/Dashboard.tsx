
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { setupMongoDB } from '@/utils/setupMongoDB';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle2, AlertCircle, RefreshCw, Database } from 'lucide-react';
import Loading from '@/components/ui/loading';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import MongoDBInitializationPanel from '@/components/admin/MongoDBInitializationPanel';
import SubscriptionPackageManagement from '@/components/admin/subscription/SubscriptionManagement';
import MigrationUtility from '@/components/admin/MigrationUtility';
import { useToast } from '@/hooks/use-toast';

const Dashboard = () => {
  const [isInitializing, setIsInitializing] = useState(true);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('Connecting to MongoDB...');
  const [dbStatus, setDbStatus] = useState<{success: boolean; message: string; collections: string[]} | null>(null);
  const { toast } = useToast();

  // Force MongoDB initialization on component mount
  useEffect(() => {
    // Initialize MongoDB when component mounts
    const initDb = async () => {
      setIsInitializing(true);
      setProgress(0);
      setStatusMessage('Connecting to MongoDB...');
      
      try {
        console.log('Admin Dashboard: Forcefully initializing MongoDB...');
        
        // Use the setupMongoDB function with a progress callback
        const result = await setupMongoDB((progressValue, message) => {
          setProgress(progressValue);
          setStatusMessage(message);
        });
        
        console.log('MongoDB initialization result:', result);
        
        setDbStatus({
          success: true,
          message: 'MongoDB initialized successfully',
          collections: result.collections
        });

        // Show success toast notification
        toast({
          title: "MongoDB Initialized",
          description: `Successfully created ${result.collections.length} collections`,
        });
      } catch (error) {
        console.error('Failed to initialize MongoDB:', error);
        setDbStatus({
          success: false,
          message: `MongoDB initialization failed: ${error instanceof Error ? error.message : String(error)}`,
          collections: []
        });
        
        // Show error toast notification
        toast({
          title: "MongoDB Initialization Failed",
          description: error instanceof Error ? error.message : String(error),
          variant: "destructive"
        });
      } finally {
        setIsInitializing(false);
      }
    };

    initDb();
  }, [toast]);

  const handleRetryInitialization = () => {
    setIsInitializing(true);
    setProgress(0);
    setStatusMessage('Connecting to MongoDB...');
    
    // Re-run the initialization
    setupMongoDB((progressValue, message) => {
      setProgress(progressValue);
      setStatusMessage(message);
    })
    .then(result => {
      console.log('MongoDB initialization retry result:', result);
      setDbStatus({
        success: true,
        message: 'MongoDB initialized successfully',
        collections: result.collections
      });
      
      // Show success toast notification
      toast({
        title: "MongoDB Reinitialized",
        description: `Successfully created ${result.collections.length} collections`,
      });
    })
    .catch(error => {
      console.error('Failed to initialize MongoDB on retry:', error);
      setDbStatus({
        success: false,
        message: `MongoDB initialization failed: ${error instanceof Error ? error.message : String(error)}`,
        collections: []
      });
      
      // Show error toast notification
      toast({
        title: "MongoDB Initialization Failed",
        description: error instanceof Error ? error.message : String(error),
        variant: "destructive"
      });
    })
    .finally(() => {
      setIsInitializing(false);
    });
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      
      {isInitializing && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="h-5 w-5 mr-2" />
              Initializing MongoDB...
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Progress value={progress} className="w-full h-2" />
            <p className="text-sm text-muted-foreground">{statusMessage}</p>
          </CardContent>
        </Card>
      )}

      {!isInitializing && dbStatus && (
        <Alert variant={dbStatus.success ? "default" : "destructive"}>
          {dbStatus.success ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          <AlertTitle>{dbStatus.success ? "Success" : "Error"}</AlertTitle>
          <AlertDescription>
            <div className="space-y-2">
              <p>{dbStatus.message}</p>
              {dbStatus.success && (
                <p className="text-sm text-muted-foreground">
                  Collections created: {dbStatus.collections.join(', ')}
                </p>
              )}
              {!dbStatus.success && (
                <Button 
                  onClick={handleRetryInitialization} 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry Initialization
                </Button>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}
      
      <Tabs defaultValue="db" className="w-full">
        <TabsList className="w-full md:w-auto">
          <TabsTrigger value="db">Database</TabsTrigger>
          <TabsTrigger value="migration">Migration</TabsTrigger>
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="db" className="space-y-4">
          <MongoDBInitializationPanel />
        </TabsContent>
        
        <TabsContent value="migration" className="space-y-4">
          <MigrationUtility />
        </TabsContent>
        
        <TabsContent value="subscriptions" className="space-y-4">
          <SubscriptionPackageManagement 
            onPermissionError={(error) => {
              toast({
                title: "Permission Error",
                description: String(error),
                variant: "destructive"
              });
            }} 
          />
        </TabsContent>
        
        <TabsContent value="stats" className="space-y-4">
          <Card className="bg-white border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle>Dashboard Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Statistics dashboard coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
