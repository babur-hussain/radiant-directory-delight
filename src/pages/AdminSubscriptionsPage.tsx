
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Plus, FileText, Settings, Users } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import UserSubscriptionsTable from "@/components/admin/subscription/UserSubscriptionsTable";
import SubscriptionPackagesTable from "@/components/admin/subscription/SubscriptionPackagesTable";
import SubscriptionSettingsPanel from "@/components/admin/subscription/SubscriptionSettingsPanel";
import SubscriptionCreateForm from "@/components/admin/subscription/SubscriptionCreateForm";
import DatabaseConnectionStatus from "@/components/admin/DatabaseConnectionStatus";
import { setupSupabase, checkSupabaseConnection } from "@/utils/setupSupabase";
import { supabase } from "@/integrations/supabase/client";
import { ISubscription, SubscriptionStatus, PaymentType, BillingCycle } from "@/models/Subscription";
import { useToast } from "@/hooks/use-toast";

const AdminSubscriptionsPage = () => {
  const [activeTab, setActiveTab] = useState("subscriptions");
  const [isLoading, setIsLoading] = useState(true);
  const [subscriptions, setSubscriptions] = useState<ISubscription[]>([]);
  const [packages, setPackages] = useState([]);
  const [dbConnected, setDbConnected] = useState(false);
  const { toast } = useToast();

  const fetchSubscriptions = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("user_subscriptions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      const formattedSubscriptions = data.map(item => ({
        id: item.id,
        userId: item.user_id,
        packageId: item.package_id,
        packageName: item.package_name,
        status: item.status as SubscriptionStatus,
        startDate: item.start_date,
        endDate: item.end_date,
        amount: item.amount,
        paymentType: item.payment_type as PaymentType,
        paymentMethod: item.payment_method,
        transactionId: item.transaction_id,
        billingCycle: item.billing_cycle as BillingCycle,
        signupFee: item.signup_fee,
        recurring: item.recurring,
        cancelledAt: item.cancelled_at,
        cancelReason: item.cancel_reason,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
        razorpaySubscriptionId: item.razorpay_subscription_id,
        razorpayOrderId: item.razorpay_order_id,
        recurringAmount: item.recurring_amount,
        nextBillingDate: item.next_billing_date,
        actualStartDate: item.actual_start_date,
        dashboardFeatures: item.dashboard_features,
        dashboardSections: item.dashboard_sections
      }));

      setSubscriptions(formattedSubscriptions);
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
      toast({
        title: "Error",
        description: "Failed to fetch subscriptions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPackages = async () => {
    try {
      const { data, error } = await supabase
        .from("subscription_packages")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      setPackages(data);
    } catch (error) {
      console.error("Error fetching packages:", error);
      toast({
        title: "Error",
        description: "Failed to fetch subscription packages.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const initializeDB = async () => {
      try {
        const isConnected = await checkSupabaseConnection();
        setDbConnected(isConnected);

        if (isConnected) {
          fetchSubscriptions();
          fetchPackages();
        } else {
          const result = await setupSupabase();
          setDbConnected(result.success);
        }
      } catch (error) {
        console.error("Error initializing database:", error);
        setDbConnected(false);
      }
    };

    initializeDB();
  }, []);

  const handleRefreshData = () => {
    fetchSubscriptions();
    fetchPackages();
  };

  const handleConnectionRetry = async () => {
    setIsLoading(true);
    try {
      const result = await setupSupabase();
      setDbConnected(result.success);
      if (result.success) {
        fetchSubscriptions();
        fetchPackages();
        toast({
          title: "Success",
          description: "Database connection established successfully!",
          variant: "success",
        });
      } else {
        toast({
          title: "Connection Failed",
          description: "Could not connect to the database. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error retrying connection:", error);
      toast({
        title: "Error",
        description: "Failed to establish database connection.",
        variant: "destructive",
      });
      setDbConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Subscription Management</h1>
          <p className="text-muted-foreground">
            Manage subscriptions, packages, and settings
          </p>
        </div>
        <DatabaseConnectionStatus
          connected={dbConnected}
          onRetryConnection={handleConnectionRetry}
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="subscriptions" className="flex items-center">
            <Users className="h-4 w-4 mr-2" />
            User Subscriptions
          </TabsTrigger>
          <TabsTrigger value="packages" className="flex items-center">
            <FileText className="h-4 w-4 mr-2" />
            Subscription Packages
          </TabsTrigger>
          <TabsTrigger value="new-subscription" className="flex items-center">
            <Plus className="h-4 w-4 mr-2" />
            Create Subscription
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="subscriptions" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <div>
                <CardTitle>User Subscriptions</CardTitle>
                <CardDescription>
                  View and manage all user subscriptions
                </CardDescription>
              </div>
              <Button
                onClick={handleRefreshData}
                variant="outline"
                className="mt-4 sm:mt-0"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Refresh Data"
                )}
              </Button>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                  <p className="text-muted-foreground">
                    Loading subscriptions data...
                  </p>
                </div>
              ) : !dbConnected ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <p className="text-muted-foreground mb-4">
                    Database connection is required to view subscriptions.
                  </p>
                  <Button onClick={handleConnectionRetry}>
                    Connect to Database
                  </Button>
                </div>
              ) : subscriptions.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">
                    No subscriptions found.
                  </p>
                  <Button onClick={() => setActiveTab("new-subscription")}>
                    Create New Subscription
                  </Button>
                </div>
              ) : (
                <UserSubscriptionsTable subscriptions={subscriptions} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="packages" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <div>
                <CardTitle>Subscription Packages</CardTitle>
                <CardDescription>
                  Manage available subscription plans
                </CardDescription>
              </div>
              <Button
                onClick={handleRefreshData}
                variant="outline"
                className="mt-4 sm:mt-0"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Refresh Data"
                )}
              </Button>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                  <p className="text-muted-foreground">
                    Loading packages data...
                  </p>
                </div>
              ) : !dbConnected ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <p className="text-muted-foreground mb-4">
                    Database connection is required to view packages.
                  </p>
                  <Button onClick={handleConnectionRetry}>
                    Connect to Database
                  </Button>
                </div>
              ) : packages.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">
                    No subscription packages found.
                  </p>
                </div>
              ) : (
                <SubscriptionPackagesTable packages={packages} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="new-subscription" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Create New Subscription</CardTitle>
              <CardDescription>
                Assign a subscription plan to a user
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!dbConnected ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <p className="text-muted-foreground mb-4">
                    Database connection is required to create subscriptions.
                  </p>
                  <Button onClick={handleConnectionRetry}>
                    Connect to Database
                  </Button>
                </div>
              ) : (
                <SubscriptionCreateForm packages={packages} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Subscription Settings</CardTitle>
              <CardDescription>
                Configure global subscription settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!dbConnected ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <p className="text-muted-foreground mb-4">
                    Database connection is required to modify settings.
                  </p>
                  <Button onClick={handleConnectionRetry}>
                    Connect to Database
                  </Button>
                </div>
              ) : (
                <SubscriptionSettingsPanel />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
};

export default AdminSubscriptionsPage;
