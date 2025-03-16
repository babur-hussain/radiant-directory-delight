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
import Loading from "@/components/ui/loading";

const AdminDashboardPage = () => {
  const { user, isAuthenticated, initialized } = useAuth();
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
  
  // State for users tab
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  
  const { businesses, isRefreshing, refreshData } = useBusinessListings();

  // Check if user is authorized (admin or staff)
  console.log("Admin Dashboard Auth Check:", { 
    user,
    isAuthenticated,
    initialized,
    userRole: user?.role,
    isAdmin: user?.isAdmin,
    email: user?.email
  });

  // We'll check authorization once auth is initialized
  const isAuthorized = user && (
    user.role === "Admin" || 
    user.role === "admin" || 
    user.role === "staff" || 
    user.isAdmin || 
    (user.email === "baburhussain660@gmail.com")
  );

  // Function to load users data
  const loadUsersData = async () => {
    setIsLoadingUsers(true);
    try {
      // Show loading toast
      toast({
        title: "Loading Users",
        description: "Initializing user data...",
      });
      
      console.log("Admin Dashboard: Ensuring test users exist first");
      await ensureTestUsers();
      
      console.log("Admin Dashboard: Now refreshing all users");
      const userCount = await debugRefreshUsers();
      console.log(`Admin Dashboard: Found ${userCount} users`);
      
      toast({
        title: "Users Refreshed",
        description: `Successfully loaded ${userCount} users`,
      });
    } catch (error) {
      console.error("Error loading users data:", error);
      toast({
        title: "Error Loading Users",
        description: "Could not load users from Firebase",
        variant: "destructive",
      });
    } finally {
      setIsLoadingUsers(false);
    }
  };

  useEffect(() => {
    // Clear any permission errors when changing tabs
    setPermissionError(null);
    
    // Load users data when in users tab
    if (activeTab === "users") {
      loadUsersData();
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
  
  // Update the handleBusinessFormSubmit to return a Promise
  const handleBusinessFormSubmit = async (values: BusinessFormValues): Promise<void> => {
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

  // Function to manually refresh user data
  const handleRefreshUsers = () => {
    if (activeTab === "users") {
      loadUsersData();
    }
  };

  // Wait for auth to initialize before checking authorization
  if (!initialized) {
    return <Loading size="lg" message="Initializing authentication..." />;
  }

  // Special case handling for the default admin email
  if (user?.email === "baburhussain660@gmail.com") {
    console.log("Default admin email detected, granting access");
  }

  if (!isAuthenticated) {
    console.log("User not authenticated, showing unauthorized view");
    return <UnauthorizedView />;
  }

  if (!isAuthorized) {
    console.log("User authenticated but not authorized:", user?.role, user?.isAdmin);
    return <UnauthorizedView />;
  }

  console.log("User authorized, showing admin dashboard");
  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      
      <AdminPermissionError 
        permissionError={permissionError} 
        dismissError={dismissError} 
      />
      
      {isLoadingUsers && activeTab === "users" && (
        <div className="mb-4">
          <Loading 
            size="md" 
            message="Loading users data..." 
            className="my-4"
          />
        </div>
      )}
      
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
        onRefreshUsers={handleRefreshUsers}
      />
    </div>
  );
};

export default AdminDashboardPage;
