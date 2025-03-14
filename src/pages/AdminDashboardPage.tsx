
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { SubscriptionManagement } from "@/components/admin/SubscriptionManagement";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserIcon, CreditCard, Users, Package, Building, Database, Shield } from "lucide-react";
import UserPermissionsTab from "@/components/admin/UserPermissionsTab";

const AdminDashboardPage = () => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const defaultTab = searchParams.get('tab') || 'subscriptions';
  
  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-10">
        <Card>
          <CardHeader>
            <CardTitle>Admin Dashboard</CardTitle>
            <CardDescription>
              Please sign in to access the admin dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>You need to be logged in as an admin to access this page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Check if user has admin privileges
  if (!user?.isAdmin) {
    return (
      <div className="container mx-auto px-4 py-10">
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You don't have permission to access this page
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>This page is only accessible to administrators.</p>
            <Link to="/" className="text-primary hover:underline mt-4 inline-block">
              Return to Home
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold tracking-tight mb-6">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Subscribers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Business Subscribers</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">89</div>
            <p className="text-xs text-muted-foreground">+8% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Influencer Subscribers</CardTitle>
            <UserIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">67</div>
            <p className="text-xs text-muted-foreground">+15% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹256,489</div>
            <p className="text-xs text-muted-foreground">+18% from last month</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Link to="/admin/businesses">
          <Card className="hover:border-primary hover:shadow-md transition-all cursor-pointer">
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="bg-primary/10 rounded-full p-3">
                <Building className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">Business Listings</CardTitle>
                <CardDescription>
                  Upload and manage business data
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Upload CSV files to bulk import businesses, view and edit listings.
              </p>
            </CardContent>
          </Card>
        </Link>
        
        <Link to="/admin/dashboard?tab=subscriptions">
          <Card className="hover:border-primary hover:shadow-md transition-all cursor-pointer">
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="bg-primary/10 rounded-full p-3">
                <CreditCard className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">Subscriptions</CardTitle>
                <CardDescription>
                  Manage user subscriptions
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                View and manage user subscription data, payments, and renewals.
              </p>
            </CardContent>
          </Card>
        </Link>
        
        <Link to="/admin/dashboard?tab=users">
          <Card className="hover:border-primary hover:shadow-md transition-all cursor-pointer">
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="bg-primary/10 rounded-full p-3">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">User Management</CardTitle>
                <CardDescription>
                  Manage user accounts
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Add, edit, or remove user accounts, manage permissions.
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
      
      <Tabs defaultValue={defaultTab}>
        <TabsList>
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>
        <TabsContent value="subscriptions" className="mt-6">
          <SubscriptionManagement />
        </TabsContent>
        <TabsContent value="users" className="mt-6">
          <UserPermissionsTab />
        </TabsContent>
        <TabsContent value="reports" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Reports</CardTitle>
              <CardDescription>View financial and subscription reports</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Reporting functionality would be implemented here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboardPage;
