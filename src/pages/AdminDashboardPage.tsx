
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import UnauthorizedView from "@/components/admin/UnauthorizedView";
import { SubscriptionManagement } from "@/components/admin/SubscriptionManagement";
import { SubscriptionPackageManagement } from "@/components/admin/subscription/SubscriptionManagement";
import UserPermissionsTab from "@/components/admin/UserPermissionsTab";
import { TableBusinessListings } from "@/components/admin/TableBusinessListings";
import ManageCategoriesLocations from "@/components/admin/ManageCategoriesLocations";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, ShieldAlert } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

const AdminDashboardPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("businesses");
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const { toast } = useToast();

  // Check if user is authorized (admin or staff)
  const isAuthorized = user && (user.role === "Admin" || user.role === "staff");

  useEffect(() => {
    // Clear any permission errors when changing tabs
    setPermissionError(null);
  }, [activeTab]);

  // Error handler for permission issues
  const handlePermissionError = (error: any) => {
    console.error("Permission error in admin dashboard:", error);
    const errorMessage = error instanceof Error ? error.message : "Access denied. You don't have sufficient permissions.";
    
    setPermissionError(errorMessage);
    
    toast({
      title: "Permission Error",
      description: errorMessage,
      variant: "destructive",
    });
  };

  // Function to dismiss error
  const dismissError = () => {
    setPermissionError(null);
  };

  if (!isAuthorized) {
    return <UnauthorizedView />;
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      
      {permissionError && (
        <Alert variant="destructive" className="mb-6">
          <ShieldAlert className="h-5 w-5" />
          <AlertTitle>Permission Error</AlertTitle>
          <AlertDescription className="flex flex-col gap-2">
            <p>{permissionError}</p>
            <p className="text-sm">
              This usually happens when your Firebase security rules do not allow the operation.
              Please check your Firebase rules or contact your administrator.
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={dismissError} 
              className="self-end mt-2"
            >
              Dismiss
            </Button>
          </AlertDescription>
        </Alert>
      )}
      
      <Tabs defaultValue="businesses" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="businesses">Businesses</TabsTrigger>
          <TabsTrigger value="categories-locations">Categories & Locations</TabsTrigger>
          <TabsTrigger value="subscription-packages">Subscription Packages</TabsTrigger>
          <TabsTrigger value="subscriptions">Active Subscriptions</TabsTrigger>
          <TabsTrigger value="users">User Permissions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="businesses" className="pt-6">
          <TableBusinessListings />
        </TabsContent>
        
        <TabsContent value="categories-locations" className="pt-6">
          <ManageCategoriesLocations />
        </TabsContent>
        
        <TabsContent value="subscription-packages" className="pt-6">
          <SubscriptionPackageManagement onPermissionError={handlePermissionError} />
        </TabsContent>
        
        <TabsContent value="subscriptions" className="pt-6">
          <SubscriptionManagement />
        </TabsContent>
        
        <TabsContent value="users" className="pt-6">
          <UserPermissionsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboardPage;
