import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, Plus, RefreshCw } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import checkSupabaseConnection from "@/utils/setupSupabase";
import { Subscription, SubscriptionStatus, PaymentType, BillingCycle } from "@/models/Subscription";
import { ISubscriptionPackage } from "@/models/SubscriptionPackage";
import Loading from "@/components/ui/loading";

import SubscriptionPackagesTable from "@/components/admin/subscription/SubscriptionPackagesTable";
import SubscriptionSettingsPanel from "@/components/admin/subscription/SubscriptionSettingsPanel";
import DatabaseConnectionStatus from "@/components/admin/DatabaseConnectionStatus";
import CentralizedSubscriptionManager from "@/components/admin/subscription/CentralizedSubscriptionManager";
import { toast } from "@/hooks/use-toast";

const AdminSubscriptionsPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("packages");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [packages, setPackages] = useState<ISubscriptionPackage[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [dbConnected, setDbConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [editingPackage, setEditingPackage] = useState<ISubscriptionPackage | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
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
  
  // Helper function to transform Supabase data to our app model
  const transformPackageData = (pkg: any): ISubscriptionPackage => {
    return {
      id: pkg.id,
      title: pkg.title,
      price: pkg.price,
      monthlyPrice: pkg.monthly_price,
      durationMonths: pkg.duration_months || 12,
      shortDescription: pkg.short_description,
      fullDescription: pkg.full_description,
      features: pkg.features || [],
      popular: pkg.popular || false,
      setupFee: pkg.setup_fee || 0,
      type: (pkg.type as 'Business' | 'Influencer') || 'Business',
      paymentType: pkg.payment_type as PaymentType || 'recurring',
      billingCycle: pkg.billing_cycle as BillingCycle,
      dashboardSections: pkg.dashboard_sections || [],
      termsAndConditions: pkg.terms_and_conditions,
      advancePaymentMonths: pkg.advance_payment_months || 0,
      maxBusinesses: pkg.max_businesses || 1, 
      maxInfluencers: pkg.max_influencers || 1
    };
  };
  
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const { data: packagesData, error: packagesError } = await supabase
        .from('subscription_packages')
        .select('*');
      
      if (packagesError) throw packagesError;
      
      const { data: subscriptionsData, error: subscriptionsError } = await supabase
        .from('user_subscriptions')
        .select('*');
      
      if (subscriptionsError) throw subscriptionsError;
      
      const transformedPackages: ISubscriptionPackage[] = packagesData.map(pkg => transformPackageData(pkg));
      
      setPackages(transformedPackages);
      setSubscriptions(subscriptionsData.map(sub => ({
        id: sub.id,
        userId: sub.user_id,
        packageId: sub.package_id,
        packageName: sub.package_name,
        status: sub.status as SubscriptionStatus,
        startDate: sub.start_date,
        endDate: sub.end_date,
        amount: sub.amount,
        paymentType: sub.payment_type as PaymentType,
        paymentMethod: sub.payment_method,
        transactionId: sub.transaction_id,
        billingCycle: (sub.payment_type === 'recurring' ? 'monthly' : 'yearly') as BillingCycle,
        signupFee: sub.signup_fee,
        recurring: sub.is_pausable,
        cancelledAt: sub.cancelled_at,
        cancelReason: sub.cancel_reason,
        createdAt: sub.created_at,
        updatedAt: sub.updated_at,
        razorpaySubscriptionId: '',
        razorpayOrderId: '',
        recurringAmount: sub.amount,
        nextBillingDate: sub.assigned_at,
        actualStartDate: sub.actual_start_date,
        dashboardFeatures: [],
        dashboardSections: []
      })));
    } catch (error) {
      console.error('Error fetching subscription data:', error);
      setConnectionError(error instanceof Error ? error.message : String(error));
      toast({
        title: "Error",
        description: `Failed to fetch subscription data: ${error instanceof Error ? error.message : String(error)}`,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (dbConnected) {
      fetchData();
    }
  }, [dbConnected]);
  
  const handleCreatePackage = async (data: ISubscriptionPackage) => {
    try {
      setIsSaving(true);
      
      // Transform the ISubscriptionPackage data to match Supabase schema (snake_case)
      const supabaseData = {
        id: data.id || `pkg_${Date.now()}`,
        title: data.title,
        price: data.price,
        monthly_price: data.monthlyPrice || 0,
        duration_months: data.durationMonths || 12,
        short_description: data.shortDescription || '',
        full_description: data.fullDescription || '',
        features: Array.isArray(data.features) ? data.features : [],
        popular: data.popular || false,
        setup_fee: data.setupFee || 0,
        type: data.type || 'Business',
        payment_type: data.paymentType || 'recurring',
        billing_cycle: data.billingCycle || 'yearly',
        dashboard_sections: data.dashboardSections || [],
        terms_and_conditions: data.termsAndConditions || '',
        advance_payment_months: data.advancePaymentMonths || 0,
        max_businesses: data.maxBusinesses || 1,
        max_influencers: data.maxInfluencers || 1
      };
      
      console.log('Saving package data to Supabase:', supabaseData);
      
      const { data: savedData, error, status } = await supabase
        .from('subscription_packages')
        .upsert([supabaseData]) // Ensure we're passing an array here
        .select();
      
      console.log('Supabase response:', { data: savedData, error, status });
      
      if (error) {
        console.error('Error creating package:', error);
        toast({
          title: "Error",
          description: `Failed to save package: ${error.message}`,
          variant: "destructive"
        });
        throw error;
      }
      
      if (!savedData || savedData.length === 0) {
        throw new Error('No data returned from Supabase after save');
      }
      
      toast({
        title: "Success",
        description: "Package saved successfully",
        variant: "default"
      });
      
      console.log('Package saved successfully:', savedData);
      
      await fetchData();
      setIsDialogOpen(false);
      setEditingPackage(null);
    } catch (error) {
      console.error('Error creating package:', error);
      setConnectionError(error instanceof Error ? error.message : String(error));
      toast({
        title: "Error",
        description: `Failed to save package: ${error instanceof Error ? error.message : String(error)}`,
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleEditPackage = (pkg: ISubscriptionPackage) => {
    setEditingPackage(pkg);
    setIsDialogOpen(true);
  };
  
  const handleDeletePackage = async (id: string) => {
    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from('subscription_packages')
        .delete()
        .eq('id', id);
      
      if (error) {
        toast({
          title: "Error",
          description: `Failed to delete package: ${error.message}`,
          variant: "destructive"
        });
        throw error;
      }
      
      toast({
        title: "Success",
        description: "Package deleted successfully",
        variant: "default"
      });
      
      await fetchData();
    } catch (error) {
      console.error('Error deleting package:', error);
      setConnectionError(error instanceof Error ? error.message : String(error));
    } finally {
      setIsLoading(false);
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
            <Button variant="outline" onClick={() => fetchData()} disabled={isLoading}>
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
                      packages={packages}
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
          isSaving={isSaving}
        />
      </div>
    </DashboardLayout>
  );
};

export default AdminSubscriptionsPage;
