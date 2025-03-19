import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { setupMongoDB, autoInitMongoDB } from '@/utils/setupMongoDB';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle2, AlertCircle, RefreshCw, Database, Activity } from 'lucide-react';
import Loading from '@/components/ui/loading';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import MongoDBInitializationPanel from '@/components/admin/MongoDBInitializationPanel';
import SubscriptionPackageManagement from '@/components/admin/subscription/SubscriptionManagement';
import MigrationUtility from '@/components/admin/MigrationUtility';
import SeedDataPanel from '@/components/admin/dashboard/SeedDataPanel';
import { useToast } from '@/hooks/use-toast';
import { connectToMongoDB, isMongoDBConnected } from '@/config/mongodb';
import { fullSyncPackages } from '@/utils/syncMongoFirebase';
import { diagnoseMongoDbConnection, testConnectionWithRetry } from '@/utils/mongoDebug';
import AdminLayout from '@/components/admin/AdminLayout';

const Dashboard = () => {
  const [isInitializing, setIsInitializing] = useState(true);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('Connecting to MongoDB...');
  const [dbStatus, setDbStatus] = useState<{success: boolean; message: string; collections: any} | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [diagnosticResults, setDiagnosticResults] = useState<any>(null);
  const [connectionStatus, setConnectionStatus] = useState('Not Connected');
  const { toast } = useToast();

  useEffect(() => {
    const initDb = async () => {
      try {
        setConnectionError(null);
        console.log('Testing MongoDB connection with retry...');
        const connected = await testConnectionWithRetry(3, 2000);
        
        if (!connected) {
          const errorMsg = 'Failed to connect to MongoDB after multiple attempts. Please check your connection string and network.';
          setConnectionError(errorMsg);
          throw new Error(errorMsg);
        }
        console.log('MongoDB connection established');
      } catch (connError) {
        console.error('MongoDB connection error:', connError);
        setConnectionError(connError instanceof Error ? connError.message : String(connError));
        toast({
          title: "MongoDB Connection Error",
          description: String(connError),
          variant: "destructive"
        });
      }

      setIsInitializing(true);
      setProgress(0);
      setStatusMessage('Setting up MongoDB collections...');
      
      try {
        console.log('Admin Dashboard: Forcefully initializing MongoDB...');
        
        const result = await setupMongoDB((progressValue, message) => {
          setProgress(progressValue);
          setStatusMessage(message);
        });
        
        console.log('MongoDB initialization result:', result);
        
        setDbStatus({
          success: result.success,
          message: 'MongoDB initialized successfully',
          collections: result.collections
        });

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
    setConnectionError(null);
    
    setupMongoDB((progressValue, message) => {
      setProgress(progressValue);
      setStatusMessage(message);
    })
    .then(result => {
      console.log('MongoDB initialization retry result:', result);
      setDbStatus({
        success: result.success,
        message: 'MongoDB initialized successfully',
        collections: result.collections
      });
      
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

  const handleDiagnoseMongoDB = async () => {
    setIsDiagnosing(true);
    try {
      const diagnostics = await diagnoseMongoDbConnection();
      setDiagnosticResults(diagnostics);
      
      toast({
        title: "MongoDB Diagnostics Complete",
        description: `Current connection state: ${diagnosticResults.connectionState}`,
      });
    } catch (error) {
      console.error("Error running MongoDB diagnostics:", error);
      toast({
        title: "Diagnostics Failed",
        description: error instanceof Error ? error.message : String(error),
        variant: "destructive"
      });
    } finally {
      setIsDiagnosing(false);
    }
  };

  const handleSyncPackages = async () => {
    setIsSyncing(true);
    try {
      // First check if MongoDB is connected
      if (!isMongoDBConnected()) {
        const connected = await connectToMongoDB();
        if (!connected) {
          throw new Error("Failed to connect to MongoDB. Cannot sync without database connection.");
        }
      }
      
      const result = await fullSyncPackages();
      
      if (result.success) {
        toast({
          title: "Sync Successful",
          description: `Synced ${result.mongoToFirebase} packages to Firebase and ${result.firebaseToMongo} packages to MongoDB`,
        });
      } else {
        toast({
          title: "Sync Partially Failed",
          description: `Some packages may not have been synced properly. Check console for details.`,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error syncing packages:", error);
      toast({
        title: "Sync Failed",
        description: error instanceof Error ? error.message : String(error),
        variant: "destructive"
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleManualConnect = async () => {
    try {
      setStatusMessage('Manually connecting to MongoDB...');
      setConnectionError(null);
      
      const connected = await testConnectionWithRetry(3, 2000);
      if (!connected) {
        const errorMsg = 'Failed to manually connect to MongoDB after multiple attempts';
        setConnectionError(errorMsg);
        throw new Error(errorMsg);
      }
      
      toast({
        title: "Connection Successful",
        description: "Successfully connected to MongoDB database",
      });
      
      // If we're connected, try to initialize
      handleRetryInitialization();
    } catch (error) {
      console.error("Manual connection error:", error);
      setConnectionError(error instanceof Error ? error.message : String(error));
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : String(error),
        variant: "destructive"
      });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <div className="flex gap-2">
            <Button 
              onClick={handleDiagnoseMongoDB} 
              variant="outline"
              disabled={isDiagnosing}
              className="flex items-center gap-2"
            >
              <Activity className={`h-4 w-4 ${isDiagnosing ? 'animate-pulse' : ''}`} />
              {isDiagnosing ? 'Diagnosing...' : 'Diagnose MongoDB'}
            </Button>
            
            <Button 
              onClick={handleManualConnect} 
              variant="outline"
              disabled={isInitializing}
              className="flex items-center gap-2"
            >
              <Database className="h-4 w-4" />
              Connect to MongoDB
            </Button>
            
            <Button 
              onClick={handleSyncPackages} 
              disabled={isSyncing || isInitializing}
              className="flex items-center gap-2"
            >
              {isSyncing ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" />
                  Sync MongoDB ↔ Firebase
                </>
              )}
            </Button>
          </div>
        </div>
        
        {diagnosticResults && (
          <Alert className="bg-blue-50 border-blue-200">
            <Activity className="h-4 w-4" />
            <AlertTitle>MongoDB Diagnostic Results</AlertTitle>
            <AlertDescription>
              <div className="space-y-1 text-sm">
                <p><strong>Environment:</strong> {diagnosticResults.environment}</p>
                <p><strong>Connection State:</strong> {diagnosticResults.connectionState}</p>
                <p><strong>URI:</strong> {diagnosticResults.uri}</p>
              </div>
            </AlertDescription>
          </Alert>
        )}
        
        {connectionError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Connection Error</AlertTitle>
            <AlertDescription>
              <div className="space-y-2">
                <p>{connectionError}</p>
                <Button 
                  onClick={handleManualConnect} 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry Connection
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}
        
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
                {dbStatus.success && dbStatus.collections && (
                  <p className="text-sm text-muted-foreground mt-2">
                    {typeof dbStatus.collections === 'object' && !Array.isArray(dbStatus.collections) ? (
                      <>Collections initialized: {Object.keys(dbStatus.collections).join(', ')}</>
                    ) : Array.isArray(dbStatus.collections) ? (
                      <>Collections created: {dbStatus.collections.join(', ')}</>
                    ) : (
                      <>MongoDB initialized successfully</>
                    )}
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
            <TabsTrigger value="seed">Seed Data</TabsTrigger>
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
              dbInitialized={dbStatus?.success || false}
              connectionStatus={connectionStatus}
              onRetryConnection={handleRetryInitialization}
            />
          </TabsContent>
          
          <TabsContent value="seed" className="space-y-4">
            <SeedDataPanel />
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
    </AdminLayout>
  );
};

export default Dashboard;
