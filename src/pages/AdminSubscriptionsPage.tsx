
import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, RefreshCw } from 'lucide-react';
import SubscriptionPackageManagement from '@/components/admin/subscription/SubscriptionManagement';
import UserSubscriptionsTable from '@/components/admin/subscription/UserSubscriptionsTable';
import CentralizedSubscriptionManager from '@/components/admin/subscription/CentralizedSubscriptionManager';
import { ISubscriptionPackage, useSubscriptionPackages } from '@/hooks/useSubscriptionPackages';
import { setupSupabase } from '@/utils/setupSupabase';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ISubscription } from '@/models/Subscription';

const AdminSubscriptionsPage = () => {
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'error' | 'offline'>('connecting');
  const [dbInitialized, setDbInitialized] = useState<boolean>(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<ISubscriptionPackage | null>(null);
  const { packages, createOrUpdate, remove, isCreating, isDeleting, refetch } = useSubscriptionPackages();
  const { toast } = useToast();

  // Fetch all subscriptions
  const { data: subscriptions = [], isLoading: isLoadingSubscriptions } = useQuery({
    queryKey: ['admin-subscriptions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data as ISubscription[];
    }
  });

  // Initial empty package template
  const initialPackage: ISubscriptionPackage = {
    id: '',
    title: '',
    price: 0,
    durationMonths: 12,
    shortDescription: '',
    fullDescription: '',
    features: [],
    type: 'Business',
    paymentType: 'recurring',
  };

  // Check connection to supabase
  useEffect(() => {
    const checkConnection = async () => {
      try {
        setConnectionStatus('connecting');
        const result = await setupSupabase();
        setDbInitialized(result.success);
        setConnectionStatus(result.success ? 'connected' : 'error');
      } catch (error) {
        console.error('Error connecting to database:', error);
        setConnectionStatus('error');
        setDbInitialized(false);
      }
    };

    checkConnection();
  }, []);

  const handleRetryConnection = async () => {
    try {
      setConnectionStatus('connecting');
      const result = await setupSupabase();
      setDbInitialized(result.success);
      setConnectionStatus(result.success ? 'connected' : 'error');
      
      if (result.success) {
        await refetch();
        toast({
          title: "Connection Restored",
          description: "Successfully connected to the database.",
        });
      } else {
        toast({
          title: "Connection Error",
          description: "Could not initialize the database. Please check your configuration.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error retrying connection:', error);
      setConnectionStatus('error');
      setDbInitialized(false);
      
      toast({
        title: "Connection Error",
        description: error instanceof Error ? error.message : "Failed to connect to the database",
        variant: "destructive"
      });
    }
  };

  const handleEditPackage = (pkg: ISubscriptionPackage) => {
    setSelectedPackage(pkg);
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const handleNewPackage = () => {
    setSelectedPackage(null);
    setIsEditing(false);
    setIsDialogOpen(true);
  };

  const handleSavePackage = async (packageData: ISubscriptionPackage) => {
    try {
      await createOrUpdate(packageData);
      toast({
        title: "Success",
        description: `Package ${isEditing ? 'updated' : 'created'} successfully.`,
      });
      setIsDialogOpen(false);
      setSelectedPackage(null);
    } catch (err) {
      console.error("Error saving package:", err);
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? 'update' : 'create'} package: ${err instanceof Error ? err.message : String(err)}`,
        variant: "destructive"
      });
    }
  };

  const handleDeletePackage = async (id: string) => {
    try {
      await remove(id);
      toast({
        title: "Success",
        description: "Package deleted successfully.",
      });
    } catch (err) {
      console.error("Error deleting package:", err);
      toast({
        title: "Error",
        description: `Failed to delete package: ${err instanceof Error ? err.message : String(err)}`,
        variant: "destructive"
      });
    }
  };

  const handlePermissionError = (error: any) => {
    toast({
      title: "Permission Error",
      description: error instanceof Error ? error.message : "You don't have permission to perform this action",
      variant: "destructive"
    });
  };

  const handleCancelEdit = () => {
    setIsDialogOpen(false);
    setSelectedPackage(null);
  };

  const handleViewSubscriptionDetails = (subscription: ISubscription) => {
    // Handle viewing subscription details
    toast({
      title: "View Subscription",
      description: `Viewing details for subscription ${subscription.id}`,
    });
  };

  const handleCancelSubscription = (subscription: ISubscription) => {
    // Handle cancelling subscription
    toast({
      title: "Cancel Subscription",
      description: `Cancelling subscription ${subscription.id}`,
      variant: "destructive"
    });
  };

  if (connectionStatus === 'connecting') {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <RefreshCw className="h-12 w-12 animate-spin text-primary mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Connecting to Database</h2>
          <p className="text-muted-foreground">Please wait while we establish a connection...</p>
        </div>
      </AdminLayout>
    );
  }

  if (connectionStatus === 'error' || connectionStatus === 'offline') {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <Alert variant="destructive" className="max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Connection Error</AlertTitle>
            <AlertDescription>
              {connectionStatus === 'error' 
                ? "Could not connect to the database. Please check your configuration." 
                : "You are currently offline. Please check your internet connection."}
            </AlertDescription>
          </Alert>
          <Button 
            onClick={handleRetryConnection} 
            className="mt-4"
            variant="default"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry Connection
          </Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Subscription Management</h1>
        <Button onClick={handleNewPackage}>Add New Package</Button>
      </div>

      <Tabs defaultValue="packages">
        <TabsList className="mb-4">
          <TabsTrigger value="packages">Packages</TabsTrigger>
          <TabsTrigger value="subscriptions">User Subscriptions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="packages">
          <SubscriptionPackageManagement 
            onPermissionError={handlePermissionError} 
            dbInitialized={dbInitialized}
            connectionStatus={connectionStatus}
            onRetryConnection={handleRetryConnection}
          />
        </TabsContent>
        
        <TabsContent value="subscriptions">
          <Card>
            <CardHeader>
              <CardTitle>User Subscriptions</CardTitle>
              <CardDescription>Manage user subscriptions and assignments</CardDescription>
            </CardHeader>
            <CardContent>
              <UserSubscriptionsTable 
                subscriptions={subscriptions} 
                isLoading={isLoadingSubscriptions}
                onViewDetails={handleViewSubscriptionDetails}
                onCancel={handleCancelSubscription}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <CentralizedSubscriptionManager
        isDialogOpen={isDialogOpen}
        setIsDialogOpen={setIsDialogOpen}
        isEditing={isEditing}
        selectedPackage={selectedPackage}
        handleSave={handleSavePackage}
        handleCancelEdit={handleCancelEdit}
        initialData={initialPackage}
      />
    </AdminLayout>
  );
};

export default AdminSubscriptionsPage;
