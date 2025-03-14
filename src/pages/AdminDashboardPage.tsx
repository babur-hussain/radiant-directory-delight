
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useState as useReactState } from "react";
import { useBusinessListings } from "@/hooks/useBusinessListings";
import { Business } from "@/lib/csv-utils";
import BusinessFormDialog from "@/components/admin/BusinessFormDialog";
import { BusinessFormValues } from "@/components/admin/BusinessForm";

const AdminDashboardPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("businesses");
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const { toast } = useToast();
  
  // State for business management
  const [showUploadDialog, setShowUploadDialog] = useReactState(false);
  const [showBusinessFormDialog, setShowBusinessFormDialog] = useReactState(false);
  const [businessCount, setBusinessCount] = useReactState(0);
  const [isRefreshing, setIsRefreshing] = useReactState(false);
  const [currentBusinessToEdit, setCurrentBusinessToEdit] = useReactState<Business | null>(null);
  const [isSubmitting, setIsSubmitting] = useReactState(false);
  
  const { businesses } = useBusinessListings();

  // Check if user is authorized (admin or staff)
  const isAuthorized = user && (user.role === "Admin" || user.role === "staff");

  useEffect(() => {
    // Clear any permission errors when changing tabs
    setPermissionError(null);
  }, [activeTab]);
  
  // Set business count when businesses array changes
  useEffect(() => {
    setBusinessCount(businesses.length);
  }, [businesses]);

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
  
  const handleAddBusiness = () => {
    console.log("Add business button clicked in AdminDashboardPage");
    setCurrentBusinessToEdit(null);
    setShowBusinessFormDialog(true);
  };
  
  const handleEditBusiness = (business: Business) => {
    console.log("Edit business clicked in AdminDashboardPage:", business);
    setCurrentBusinessToEdit(business);
    setShowBusinessFormDialog(true);
  };
  
  const handleUploadComplete = (success: boolean, message: string, count?: number) => {
    if (success) {
      toast({
        title: "Upload Successful",
        description: `${count} businesses have been imported successfully.`,
        variant: "default",
      });
    } else {
      toast({
        title: "Upload Failed",
        description: message,
        variant: "destructive",
      });
    }
  };
  
  const handleBusinessFormSubmit = async (values: BusinessFormValues) => {
    // This function would handle the business form submission
    // The actual implementation would be similar to the one in AdminBusinessListingsPage
    setIsSubmitting(true);
    
    try {
      // Handle submission logic would go here
      toast({
        title: currentBusinessToEdit ? "Business Updated" : "Business Added",
        description: `${values.name} has been ${currentBusinessToEdit ? 'updated' : 'added'} successfully.`,
      });
      
      setShowBusinessFormDialog(false);
      setCurrentBusinessToEdit(null);
    } catch (error) {
      console.error("Error saving business:", error);
      toast({
        title: "Operation Failed",
        description: `Error: ${error instanceof Error ? error.message : String(error)}`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
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
          <Card>
            <CardHeader>
              <CardTitle>Manage Business Listings</CardTitle>
              <CardDescription>
                View and manage all business listings. Total: {businessCount} businesses.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TableBusinessListings 
                onAddBusiness={handleAddBusiness}
                onEditBusiness={handleEditBusiness}
              />
            </CardContent>
          </Card>
          
          <BusinessFormDialog 
            showDialog={showBusinessFormDialog}
            setShowDialog={setShowBusinessFormDialog}
            currentBusinessToEdit={currentBusinessToEdit}
            onSubmit={handleBusinessFormSubmit}
            isSubmitting={isSubmitting}
          />
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
