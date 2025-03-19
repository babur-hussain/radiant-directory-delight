
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, WifiOff, RefreshCw } from 'lucide-react';
import UnauthorizedView from '@/components/admin/UnauthorizedView';
import SubscriptionManagement from '@/components/admin/subscription/SubscriptionManagement';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { isServerRunning } from '@/api/mongoAPI';

const AdminDashboardPage: React.FC = () => {
  const { user, isAuthenticated, initialized } = useAuth();
  const navigate = useNavigate();
  const [permissionError, setPermissionError] = useState<any>(null);
  const [connectionStatus, setConnectionStatus] = useState<"connecting" | "connected" | "error" | "offline">("connecting");
  const [activeTab, setActiveTab] = useState<string>("subscriptions");

  // Check for default admin email
  const isDefaultAdmin = (email: string | null) => {
    return email === "baburhussain660@gmail.com";
  };

  // Check connection status
  const checkConnectionStatus = async () => {
    setConnectionStatus("connecting");
    try {
      // Check if server is running
      const isRunning = await isServerRunning();
      if (isRunning) {
        console.log("Server connection successful");
        setConnectionStatus("connected");
        sessionStorage.setItem('connection_status', 'connected');
      } else {
        console.log("Server is not running");
        setConnectionStatus("offline");
        sessionStorage.setItem('connection_status', 'offline');
      }
    } catch (error) {
      console.error("Error checking server status:", error);
      setConnectionStatus("error");
      sessionStorage.setItem('connection_status', 'error');
    }
  };

  useEffect(() => {
    if (initialized && !isAuthenticated) {
      navigate('/admin');
    }
    
    // Set connection status based on localStorage or sessionStorage
    const storedStatus = sessionStorage.getItem('connection_status');
    if (storedStatus) {
      setConnectionStatus(storedStatus as any);
    } else {
      // Check connection status
      checkConnectionStatus();
      
      // After 8 seconds, assume offline if still connecting
      const timer = setTimeout(() => {
        if (connectionStatus === "connecting") {
          console.log("Connection timeout reached, assuming offline mode");
          setConnectionStatus("offline");
          sessionStorage.setItem('connection_status', 'offline');
        }
      }, 8000);
      
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, navigate, initialized, connectionStatus]);

  if (!initialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  // Allow both regular admins and the default admin email
  if (!isAuthenticated || (!user?.isAdmin && !isDefaultAdmin(user?.email))) {
    return <UnauthorizedView />;
  }

  const handleRetryConnection = () => {
    checkConnectionStatus();
  };

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold">Admin Dashboard</h1>
        
        {connectionStatus !== "connected" && (
          <Button 
            variant="outline" 
            onClick={handleRetryConnection}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Retry Connection
          </Button>
        )}
      </div>

      {permissionError && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle>Permission Error</AlertTitle>
          <AlertDescription>
            {permissionError instanceof Error ? permissionError.message : String(permissionError)}
          </AlertDescription>
        </Alert>
      )}

      {connectionStatus === "offline" && (
        <Alert variant="warning" className="mb-6">
          <WifiOff className="h-5 w-5" />
          <AlertTitle>Offline Mode</AlertTitle>
          <AlertDescription className="flex justify-between items-center">
            <span>Unable to connect to the server. Limited functionality available.</span>
            <Button 
              onClick={handleRetryConnection}
              className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition-colors"
            >
              Retry Connection
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {connectionStatus === "error" && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle>Connection Error</AlertTitle>
          <AlertDescription className="flex justify-between items-center">
            <span>Error connecting to the server. Using offline mode.</span>
            <Button 
              onClick={handleRetryConnection}
              className="px-4 py-2 bg-destructive text-white rounded hover:bg-destructive/90 transition-colors"
            >
              Retry Connection
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="subscriptions" className="w-full" onValueChange={setActiveTab} value={activeTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="subscriptions">Subscription Management</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
        </TabsList>
        <TabsContent value="subscriptions">
          <SubscriptionManagement 
            onPermissionError={(error) => setPermissionError(error)}
            dbInitialized={true}
            connectionStatus={connectionStatus}
            onRetryConnection={handleRetryConnection}
          />
        </TabsContent>
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p>User management features will be available soon.</p>
              {connectionStatus !== "connected" && (
                <Alert variant="warning" className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    User management requires an active server connection.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboardPage;
