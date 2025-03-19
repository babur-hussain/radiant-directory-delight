
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Database, RefreshCw, Play, Trash, Loader2, AlertCircle, Check } from 'lucide-react';
import { connectToMongoDB, isMongoDBConnected } from '@/config/mongodb';
import { setupMongoDB } from '@/utils/setupMongoDB';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import AdminLayout from '@/components/admin/AdminLayout';

const AdminDatabasePage = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [collections, setCollections] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      const connected = isMongoDBConnected();
      setIsConnected(connected);
    } catch (err) {
      console.error("Connection check error:", err);
      setIsConnected(false);
    }
  };

  const handleRefreshConnection = async () => {
    setIsConnecting(true);
    setError(null);
    
    try {
      const connected = await connectToMongoDB();
      setIsConnected(connected);
      
      if (connected) {
        toast({
          title: "Connection Successful",
          description: "Successfully connected to MongoDB",
        });
      } else {
        throw new Error("Failed to connect to MongoDB");
      }
    } catch (err) {
      console.error("Connection error:", err);
      setError(`Connection error: ${err instanceof Error ? err.message : String(err)}`);
      toast({
        title: "Connection Failed",
        description: `Error connecting to MongoDB: ${err instanceof Error ? err.message : String(err)}`,
        variant: "destructive"
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleInitializeDatabase = async () => {
    setIsInitializing(true);
    setProgress(0);
    setStatusMessage('Initializing database...');
    setError(null);
    setCollections([]);
    
    try {
      const result = await setupMongoDB((progressValue, message) => {
        setProgress(progressValue);
        setStatusMessage(message);
      });
      
      if (result.success) {
        // Only set collections if the operation was successful
        if (Array.isArray(result.collections)) {
          setCollections(result.collections);
        } else if (result.collections && typeof result.collections === 'object') {
          setCollections(Object.keys(result.collections));
        }
        
        toast({
          title: "Database Initialized",
          description: `Successfully initialized ${Array.isArray(result.collections) ? result.collections.length : 'all'} collections`,
        });
        setError(null);
      } else {
        // If we have an error from the result, show it
        throw new Error(result.error || "Failed to initialize database");
      }
    } catch (err) {
      console.error("Initialization error:", err);
      setError(`${err instanceof Error ? err.message : String(err)}`);
      toast({
        title: "Initialization Failed",
        description: `Error initializing database: ${err instanceof Error ? err.message : String(err)}`,
        variant: "destructive"
      });
    } finally {
      setIsInitializing(false);
    }
  };

  const handleResetDatabase = () => {
    // This would be implemented to reset the database
    toast({
      title: "Not Implemented",
      description: "Database reset functionality is not implemented in this version",
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center flex-wrap gap-2">
          <h1 className="text-3xl font-bold">Database Management</h1>
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={handleRefreshConnection}
            disabled={isConnecting}
          >
            {isConnecting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            {isConnecting ? "Connecting..." : "Refresh Connection"}
          </Button>
        </div>
        
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <Card>
          <CardHeader>
            <CardTitle>MongoDB Connection</CardTitle>
            <CardDescription>
              Manage your MongoDB database connection and collections
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className={`h-3 w-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span>{isConnected ? "Connected" : "Disconnected"}</span>
            </div>
            
            {isInitializing && (
              <div className="space-y-2">
                <Progress value={progress} className="h-2" />
                <p className="text-sm text-muted-foreground">{statusMessage}</p>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                variant="outline" 
                className="flex items-center justify-center gap-2"
                onClick={handleInitializeDatabase}
                disabled={isInitializing || !isConnected}
              >
                {isInitializing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
                {isInitializing ? "Initializing..." : "Initialize Database"}
              </Button>
              <Button 
                variant="outline" 
                className="flex items-center justify-center gap-2"
                disabled={!isConnected}
              >
                <Database className="h-4 w-4" />
                View Collections
              </Button>
              <Button 
                variant="outline" 
                className="flex items-center justify-center gap-2 text-red-500 hover:text-red-600"
                onClick={handleResetDatabase}
                disabled={!isConnected}
              >
                <Trash className="h-4 w-4" />
                Reset Database
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Collections</CardTitle>
            <CardDescription>
              Database collections and document counts
            </CardDescription>
          </CardHeader>
          <CardContent>
            {collections.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {collections.map((collection, index) => (
                  <Card key={index}>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold capitalize">{collection}</div>
                      <div className="text-sm text-gray-500">Collection</div>
                      <div className="mt-2 flex items-center text-green-600">
                        <Check className="h-4 w-4 mr-1" />
                        <span>Ready</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                {isConnected ? (
                  <p>No collections initialized yet. Click "Initialize Database" to create collections.</p>
                ) : (
                  <p>Connect to MongoDB to view collections.</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminDatabasePage;
