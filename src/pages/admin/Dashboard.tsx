
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import UnauthorizedView from '@/components/admin/UnauthorizedView';
import SubscriptionManagement from '@/components/admin/subscription/SubscriptionManagement';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const AdminDashboardPage: React.FC = () => {
  const { user, isAuthenticated, initialized } = useAuth();
  const navigate = useNavigate();
  const [permissionError, setPermissionError] = useState<any>(null);
  const [connectionStatus, setConnectionStatus] = useState<"connecting" | "connected" | "error" | "offline">("connecting");

  // Check for default admin email
  const isDefaultAdmin = (email: string | null) => {
    return email === "baburhussain660@gmail.com";
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
      // Default to "connecting"
      setConnectionStatus("connecting");
      // After 5 seconds, assume offline if still connecting
      const timer = setTimeout(() => {
        if (connectionStatus === "connecting") {
          setConnectionStatus("offline");
          sessionStorage.setItem('connection_status', 'offline');
        }
      }, 5000);
      
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
    setConnectionStatus("connecting");
    sessionStorage.removeItem('connection_status');
    window.location.reload();
  };

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-semibold mb-6">Admin Dashboard</h1>

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
          <AlertCircle className="h-5 w-5" />
          <AlertTitle>Connection Issues</AlertTitle>
          <AlertDescription className="flex justify-between items-center">
            <span>Unable to connect to the server. Some features may be limited.</span>
            <button 
              onClick={handleRetryConnection}
              className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition-colors"
            >
              Retry Connection
            </button>
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="subscriptions" className="w-full">
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
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboardPage;
