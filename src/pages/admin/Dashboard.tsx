
import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Users, Package, HelpCircle, AlertCircle, RefreshCw, BarChart3 } from 'lucide-react';
import StatsOverviewCard from '@/components/admin/dashboard/StatsOverviewCard';
import RecentUsersCard from '@/components/admin/dashboard/RecentUsersCard';
import RecentSubscriptionsCard from '@/components/admin/dashboard/RecentSubscriptionsCard';
import SeedDataPanel from '@/components/admin/dashboard/SeedDataPanel';
import DashboardTabContent from '@/components/admin/dashboard/DashboardTabContent';
import UsersTabContent from '@/components/admin/dashboard/UsersTabContent';
import SubscriptionsTabContent from '@/components/admin/dashboard/SubscriptionsTabContent';
import { setupSupabase } from '@/utils/setupSupabase';
import { useToast } from '@/hooks/use-toast';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'error' | 'offline'>('connecting');
  const [dbInitialized, setDbInitialized] = useState<boolean>(false);
  const { toast } = useToast();

  // Check connection to database
  useEffect(() => {
    const checkConnection = async () => {
      try {
        setConnectionStatus('connecting');
        const initialized = await setupSupabase();
        setDbInitialized(initialized);
        setConnectionStatus(initialized ? 'connected' : 'error');
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
      const initialized = await setupSupabase();
      setDbInitialized(initialized);
      setConnectionStatus(initialized ? 'connected' : 'error');
      
      if (initialized) {
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

  const handlePermissionError = (error: any) => {
    toast({
      title: "Permission Error",
      description: error instanceof Error ? error.message : "You don't have permission to perform this action",
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
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-muted-foreground" />
          <span className="text-muted-foreground">Need help?</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <StatsOverviewCard 
          title="Total Users" 
          value="Loading..." 
          description="Active accounts" 
          icon={<Users className="h-5 w-5" />} 
        />
        <StatsOverviewCard 
          title="Subscriptions" 
          value="Loading..." 
          description="Active subscriptions" 
          icon={<Package className="h-5 w-5" />} 
        />
        <StatsOverviewCard 
          title="Revenue" 
          value="₹0" 
          description="Monthly recurring" 
          icon={<BarChart3 className="h-5 w-5" />} 
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
          <TabsTrigger value="seed">Seed Data</TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard">
          <DashboardTabContent />
        </TabsContent>
        
        <TabsContent value="users">
          <UsersTabContent />
        </TabsContent>
        
        <TabsContent value="subscriptions">
          <SubscriptionsTabContent />
        </TabsContent>
        
        <TabsContent value="seed">
          <SeedDataPanel
            onPermissionError={handlePermissionError}
            dbInitialized={dbInitialized}
            connectionStatus={connectionStatus}
            onRetryConnection={handleRetryConnection}
          />
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
};

export default AdminDashboard;
