
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import UnauthorizedView from "@/components/admin/UnauthorizedView";
import { useToast } from "@/hooks/use-toast";
import { useState as useReactState } from "react";
import { useBusinessListings } from "@/hooks/useBusinessListings";
import { Business } from "@/lib/csv-utils";
import { BusinessFormValues } from "@/components/admin/BusinessForm";
import AdminPermissionError from "@/components/admin/dashboard/AdminPermissionError";
import AdminDashboardTabs from "@/components/admin/dashboard/AdminDashboardTabs";
import { loadAllUsers, debugRefreshUsers } from "@/features/auth/authStorage";
import { ensureTestUsers } from "@/features/auth/userManagement";

const AdminDashboardPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("businesses");
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const { toast } = useToast();
  
  // State for business management
  const [showUploadDialog, setShowUploadDialog] = useReactState(false);
  const [showBusinessFormDialog, setShowBusinessFormDialog] = useReactState(false);
  const [businessCount, setBusinessCount] = useReactState(0);
  const [currentBusinessToEdit, setCurrentBusinessToEdit] = useReactState<Business | null>(null);
  const [isSubmitting, setIsSubmitting] = useReactState(false);
  const [selectedBusiness, setSelectedBusiness] = useReactState<Business | null>(null);
  
  const { businesses, isRefreshing, refreshData } = useBusinessListings();

  // Check if user is authorized (admin or staff)
  const isAuthorized = user && (user.role === "Admin" || user.role === "staff" || user.isAdmin);

  useEffect(() => {
    // Clear any permission errors when changing tabs
    setPermissionError(null);
    
    // Load users data when in users tab
    if (activeTab === "users") {
      // Force refresh users data
      console.log("Admin Dashboard: Loading users for the Users tab");
      
      // Ensure we have test users in the system
      ensureTestUsers().then(() => {
        // Then refresh the users
        const userCount = debugRefreshUsers();
        console.log(`Admin Dashboard: Found ${userCount} users`);
      }).catch(error => {
        console.error("Error ensuring test users:", error);
      });
    }
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
  
  const handleViewBusinessDetails = (business: Business) => {
    console.log("View business details clicked in AdminDashboardPage:", business);
    setSelectedBusiness(business);
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
      
      <AdminPermissionError 
        permissionError={permissionError} 
        dismissError={dismissError} 
      />
      
      <AdminDashboardTabs 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        businessCount={businessCount}
        showBusinessFormDialog={showBusinessFormDialog}
        setShowBusinessFormDialog={setShowBusinessFormDialog}
        showUploadDialog={showUploadDialog}
        setShowUploadDialog={setShowUploadDialog}
        currentBusinessToEdit={currentBusinessToEdit}
        isSubmitting={isSubmitting}
        handleBusinessFormSubmit={handleBusinessFormSubmit}
        handleUploadComplete={handleUploadComplete}
        handleAddBusiness={handleAddBusiness}
        handleEditBusiness={handleEditBusiness}
        handlePermissionError={handlePermissionError}
        onViewDetails={handleViewBusinessDetails}
        businesses={businesses}
        isRefreshing={isRefreshing}
        refreshBusinesses={refreshData}
      />
    </div>
  );
};

export default AdminDashboardPage;
