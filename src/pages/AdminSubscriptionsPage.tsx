
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertCircle, Download, FileText, Database } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import SubscriptionPackageManagement from '@/components/admin/subscription/SubscriptionManagement';
import UserSubscriptionMapping from '@/components/admin/UserSubscriptionMapping';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import SubscriptionInsights from '@/components/admin/subscription/SubscriptionInsights';
import SeedDataPanel from '@/components/admin/dashboard/SeedDataPanel';
import { useAuth } from '@/hooks/useAuth';
import { useSubscriptionPackages } from '@/hooks/useSubscriptionPackages';
import checkSupabaseConnection from '@/utils/setupSupabase';

const AdminSubscriptionsPage = () => {
  const [permissionError, setPermissionError] = useState<string>('');
  const [dbInitialized, setDbInitialized] = useState<boolean>(true);
  const [connectionStatus, setConnectionStatus] = useState<string>('checking');
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Destructure needed properties from useSubscriptionPackages
  const { 
    packages, 
    isLoading, 
    isError, 
    error, 
    refetch, 
    createOrUpdate, 
    remove, 
    isCreating 
  } = useSubscriptionPackages();

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const result = await checkSupabaseConnection();
        
        if (result.connected) {
          setConnectionStatus('connected');
        } else {
          setConnectionStatus('error');
          console.error('Connection error:', result.error);
          toast({
            title: 'Database Connection Error',
            description: `Failed to connect to database: ${result.error}`,
            variant: 'destructive',
          });
        }
      } catch (err) {
        setConnectionStatus('error');
        if (err && typeof err === 'object' && 'message' in err) {
          toast({
            title: 'Error',
            description: String(err.message),
            variant: 'destructive',
          });
        }
      }
    };
    
    checkConnection();
  }, [toast]);

  const handlePermissionError = (error: any) => {
    console.error('Permission error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    setPermissionError(errorMessage);
    toast({
      title: 'Permission Error',
      description: errorMessage,
      variant: 'destructive',
    });
  };

  const dismissError = () => {
    setPermissionError('');
  };

  const handleRetryConnection = async () => {
    setConnectionStatus('checking');
    try {
      const result = await checkSupabaseConnection();
      if (result.connected) {
        setConnectionStatus('connected');
        toast({
          title: 'Connection Restored',
          description: 'Successfully connected to the database',
        });
      } else {
        setConnectionStatus('error');
        toast({
          title: 'Connection Failed',
          description: `Failed to connect: ${result.error}`,
          variant: 'destructive',
        });
      }
    } catch (err) {
      setConnectionStatus('error');
      if (err && typeof err === 'object' && 'message' in err) {
        toast({
          title: 'Connection Error',
          description: String(err.message),
          variant: 'destructive',
        });
      }
    }
  };

  // Don't allow non-admin users
  if (user && !user.isAdmin) {
    return (
      <DashboardLayout>
        <Card className="mx-auto max-w-xl">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>You don't have permission to access this page</CardDescription>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Permission Error</AlertTitle>
              <AlertDescription>
                This page is restricted to administrators only. If you believe you should have access, please contact your administrator.
              </AlertDescription>
            </Alert>
            <div className="mt-4">
              <Button onClick={() => navigate('/')}>Return to Home</Button>
            </div>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Subscription Management</CardTitle>
          <CardDescription>
            Manage subscription packages, user subscriptions, and related settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          {permissionError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Permission Error</AlertTitle>
              <AlertDescription>
                {permissionError}
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={dismissError}
                >
                  Dismiss
                </Button>
              </AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="packages">
            <TabsList>
              <TabsTrigger value="packages">Packages</TabsTrigger>
              <TabsTrigger value="users">User Subscriptions</TabsTrigger>
              <TabsTrigger value="insights">Insights</TabsTrigger>
              <TabsTrigger value="database">Database</TabsTrigger>
            </TabsList>
            <TabsContent value="packages" className="space-y-4 mt-4">
              <SubscriptionPackageManagement
                onPermissionError={handlePermissionError}
                dbInitialized={dbInitialized}
                connectionStatus={connectionStatus}
                onRetryConnection={handleRetryConnection}
              />
            </TabsContent>
            <TabsContent value="users" className="space-y-4 mt-4">
              <UserSubscriptionMapping onPermissionError={handlePermissionError} />
            </TabsContent>
            <TabsContent value="insights" className="space-y-4 mt-4">
              <SubscriptionInsights />
            </TabsContent>
            <TabsContent value="database" className="space-y-4 mt-4">
              <SeedDataPanel
                dbInitialized={dbInitialized}
                connectionStatus={connectionStatus}
                onPermissionError={handlePermissionError}
                onRetryConnection={handleRetryConnection}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default AdminSubscriptionsPage;
