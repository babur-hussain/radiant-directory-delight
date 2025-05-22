
import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, Plus, RefreshCw } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useAuth } from '@/hooks/useAuth';
import checkSupabaseConnection from "@/utils/setupSupabase";
import { Subscription, SubscriptionStatus, PaymentType, BillingCycle } from "@/models/Subscription";
import { ISubscriptionPackage } from "@/models/SubscriptionPackage";
import Loading from "@/components/ui/loading";

import SubscriptionPackagesTable from "@/components/admin/subscription/SubscriptionPackagesTable";
import SubscriptionSettingsPanel from "@/components/admin/subscription/SubscriptionSettingsPanel";
import DatabaseConnectionStatus from "@/components/admin/DatabaseConnectionStatus";
import CentralizedSubscriptionManager from "@/components/admin/subscription/CentralizedSubscriptionManager";
import { toast } from "@/hooks/use-toast";
import { useSubscriptionPackages } from "@/hooks/useSubscriptionPackages";

const AdminSubscriptionsPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("packages");
  const [dbConnected, setDbConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [editingPackage, setEditingPackage] = useState<ISubscriptionPackage | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Use the custom hook for all subscription package operations
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
  
  // Default empty package for new package creation
  const emptyPackage: ISubscriptionPackage = {
    id: '',
    title: '',
    price: 0,
    features: [],
    paymentType: 'recurring',
    type: 'Business',
    billingCycle: 'yearly',
    durationMonths: 12
  };
  
  useEffect(() => {
    const checkConnection = async () => {
      const result = await checkSupabaseConnection();
      setDbConnected(result.connected);
      setConnectionError(result.error || null);
    };
    
    checkConnection();
  }, []);
  
  useEffect(() => {
    if (dbConnected && !isLoading) {
      console.log("Database connected, loaded packages:", Array.isArray(packages) ? packages.length : 'none');
    }
  }, [dbConnected, packages, isLoading]);
  
  useEffect(() => {
    if (isError && error) {
      console.error("Error loading packages:", error);
      setConnectionError(error instanceof Error ? error.message : String(error));
    }
  }, [isError, error]);
  
  const handleCreatePackage = async (data: ISubscriptionPackage) => {
    try {
      console.log("Creating/updating package:", data);
      await createOrUpdate(data);
      setIsDialogOpen(false);
      setEditingPackage(null);
    } catch (error) {
      console.error('Error creating/updating package:', error);
      toast({
        title: "Error",
        description: `Failed to save package: ${error instanceof Error ? error.message : String(error)}`,
        variant: "destructive"
      });
    }
  };
  
  const handleEditPackage = (pkg: ISubscriptionPackage) => {
    setEditingPackage(pkg);
    setIsDialogOpen(true);
  };
  
  const handleDeletePackage = async (id: string) => {
    try {
      await remove(id);
    } catch (error) {
      console.error('Error deleting package:', error);
      setConnectionError(error instanceof Error ? error.message : String(error));
    }
  };
  
  const handleOpenCreateDialog = () => {
    setEditingPackage(null);
    setIsDialogOpen(true);
  };
  
  const handleCancelEdit = () => {
    setEditingPackage(null);
  };

  const handleConfigureRazorpay = () => {
    console.log("Configure Razorpay clicked");
    // This is just a placeholder - implement actual configuration in a future task
  };
  
  if (user && !user.isAdmin) {
    return (
      <DashboardLayout>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            You do not have admin privileges to access this page.
          </AlertDescription>
        </Alert>
      </DashboardLayout>
    );
  }
  
  return (
    <DashboardLayout>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Subscription Management</h1>
          <div className="space-x-2">
            <Button variant="outline" onClick={() => refetch()} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button onClick={handleOpenCreateDialog}>
              <Plus className="h-4 w-4 mr-2" />
              New Package
            </Button>
          </div>
        </div>
        
        <DatabaseConnectionStatus 
          connected={dbConnected} 
          databaseName="Supabase"
          error={connectionError || undefined}
        />
        
        {dbConnected && (
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList>
              <TabsTrigger value="packages">Packages</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            
            <TabsContent value="packages" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Subscription Packages</CardTitle>
                  <CardDescription>
                    Manage your subscription packages and pricing
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Loading message="Loading subscription packages..." className="py-10" />
                  ) : (
                    <SubscriptionPackagesTable 
                      packages={Array.isArray(packages) ? packages : []}
                      onEdit={handleEditPackage}
                      onDelete={handleDeletePackage}
                    />
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="settings">
              <SubscriptionSettingsPanel 
                onConfigureRazorpay={handleConfigureRazorpay}
              />
            </TabsContent>
          </Tabs>
        )}
        
        {/* Package Editor Dialog */}
        <CentralizedSubscriptionManager 
          isDialogOpen={isDialogOpen}
          setIsDialogOpen={setIsDialogOpen}
          isEditing={!!editingPackage}
          selectedPackage={editingPackage}
          handleSave={handleCreatePackage}
          handleCancelEdit={handleCancelEdit}
          initialData={emptyPackage}
          isSaving={isCreating}
        />
      </div>
    </DashboardLayout>
  );
};

export default AdminSubscriptionsPage;
