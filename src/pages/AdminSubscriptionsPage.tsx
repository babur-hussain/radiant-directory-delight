
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

import SubscriptionPackagesTable from "@/components/admin/subscription/SubscriptionPackagesTable";
import SubscriptionSettingsPanel from "@/components/admin/subscription/SubscriptionSettingsPanel";
import SubscriptionCreateForm from "@/components/admin/subscription/SubscriptionCreateForm";
import DatabaseConnectionStatus from "@/components/admin/DatabaseConnectionStatus";

const AdminSubscriptionsPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("packages");
  const [isLoading, setIsLoading] = useState(true);
  const [packages, setPackages] = useState<ISubscriptionPackage[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [dbConnected, setDbConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [editingPackage, setEditingPackage] = useState<ISubscriptionPackage | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  useEffect(() => {
    const checkConnection = async () => {
      const result = await checkSupabaseConnection();
      setDbConnected(result.connected);
      setConnectionError(result.error || null);
    };
    
    checkConnection();
  }, []);
  
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
      
      const transformedPackages: ISubscriptionPackage[] = packagesData.map(pkg => ({
        id: pkg.id,
        title: pkg.title,
        price: pkg.price,
        durationMonths: pkg.duration_months || 12,
        shortDescription: pkg.short_description,
        fullDescription: pkg.full_description,
        features: pkg.features || [],
        popular: pkg.popular,
        setupFee: pkg.setup_fee,
        type: (pkg.type as 'Business' | 'Influencer') || 'Business',
        paymentType: pkg.payment_type as PaymentType,
        billingCycle: pkg.billing_cycle as BillingCycle,
        dashboardSections: pkg.dashboard_sections,
        termsAndConditions: pkg.terms_and_conditions,
        advancePaymentMonths: pkg.advance_payment_months
      }));
      
      const transformedSubscriptions = subscriptionsData.map(sub => ({
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
      }));
      
      setPackages(transformedPackages);
      setSubscriptions(transformedSubscriptions);
    } catch (error) {
      console.error('Error fetching subscription data:', error);
      setConnectionError(error instanceof Error ? error.message : String(error));
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (dbConnected) {
      fetchData();
    }
  }, [dbConnected]);
  
  const handleCreatePackage = async (data: Partial<ISubscriptionPackage>) => {
    try {
      setIsLoading(true);
      
      const packageData = {
        ...data,
        id: data.id || `pkg_${Date.now()}`,
        features: data.features || []
      };
      
      const supabaseData = {
        id: packageData.id,
        title: packageData.title,
        price: packageData.price,
        duration_months: packageData.durationMonths || 12,
        short_description: packageData.shortDescription,
        full_description: packageData.fullDescription,
        features: packageData.features,
        popular: packageData.popular || false,
        setup_fee: packageData.setupFee || 0,
        type: packageData.type || 'Business',
        payment_type: packageData.paymentType || 'recurring',
        billing_cycle: packageData.billingCycle,
        dashboard_sections: packageData.dashboardSections || [],
        terms_and_conditions: packageData.termsAndConditions,
        advance_payment_months: packageData.advancePaymentMonths || 0
      };
      
      const { error } = await supabase
        .from('subscription_packages')
        .upsert(supabaseData);
      
      if (error) throw error;
      
      await fetchData();
      setShowCreateForm(false);
      setEditingPackage(null);
    } catch (error) {
      console.error('Error creating package:', error);
      setConnectionError(error instanceof Error ? error.message : String(error));
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleEditPackage = (pkg: ISubscriptionPackage) => {
    setEditingPackage(pkg);
    setShowCreateForm(true);
  };
  
  const handleDeletePackage = async (id: string) => {
    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from('subscription_packages')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      await fetchData();
    } catch (error) {
      console.error('Error deleting package:', error);
      setConnectionError(error instanceof Error ? error.message : String(error));
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleConfigureRazorpay = () => {
    console.log('Configure Razorpay clicked');
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
            {!showCreateForm && (
              <Button onClick={() => {
                setEditingPackage(null);
                setShowCreateForm(true);
              }}>
                <Plus className="h-4 w-4 mr-2" />
                New Package
              </Button>
            )}
          </div>
        </div>
        
        <DatabaseConnectionStatus 
          connected={dbConnected} 
          databaseName="Supabase"
          error={connectionError || undefined}
        />
        
        {dbConnected ? (
          <>
            {showCreateForm ? (
              <Card>
                <CardHeader>
                  <CardTitle>{editingPackage ? 'Edit Package' : 'Create New Package'}</CardTitle>
                  <CardDescription>
                    {editingPackage 
                      ? 'Update the details of an existing package' 
                      : 'Add a new subscription package to your offerings'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <SubscriptionCreateForm 
                    onSubmit={handleCreatePackage}
                    initialData={editingPackage || {}}
                    isEditing={!!editingPackage}
                  />
                  <div className="mt-4">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setShowCreateForm(false);
                        setEditingPackage(null);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
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
                      <SubscriptionPackagesTable 
                        packages={packages}
                        onEdit={handleEditPackage}
                        onDelete={handleDeletePackage}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="settings">
                  <SubscriptionSettingsPanel onConfigureRazorpay={handleConfigureRazorpay} />
                </TabsContent>
              </Tabs>
            )}
          </>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Database Connection Failed</CardTitle>
              <CardDescription>
                Please check your database configuration and try again
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => checkSupabaseConnection()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry Connection
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminSubscriptionsPage;
