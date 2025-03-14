
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Upload, RefreshCw } from "lucide-react";
import { UserPermissionsTab } from "@/components/admin/UserPermissionsTab";
import BusinessesTab from "./BusinessesTab";
import { SubscriptionManagement } from "@/components/admin/SubscriptionManagement";
import BusinessFormDialog from "@/components/admin/BusinessFormDialog";
import CSVUploadDialog from "@/components/admin/CSVUploadDialog";
import AdminBusinessDashboards from "./AdminBusinessDashboards";
import AdminInfluencerDashboards from "./AdminInfluencerDashboards";
import { Business } from "@/lib/csv-utils";
import { BusinessFormValues } from "@/components/admin/BusinessForm";

interface AdminDashboardTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  businessCount: number;
  showBusinessFormDialog: boolean;
  setShowBusinessFormDialog: (show: boolean) => void;
  showUploadDialog: boolean;
  setShowUploadDialog: (show: boolean) => void;
  currentBusinessToEdit: Business | null;
  isSubmitting: boolean;
  handleBusinessFormSubmit: (values: BusinessFormValues) => Promise<void>;
  handleUploadComplete: (success: boolean, message: string, count?: number) => void;
  handleAddBusiness: () => void;
  handleEditBusiness: (business: Business) => void;
  handlePermissionError: (error: any) => void;
  onViewDetails: (business: Business) => void;
  businesses: Business[];
  isRefreshing: boolean;
  refreshBusinesses: () => void;
  onRefreshUsers: () => void;
}

const AdminDashboardTabs: React.FC<AdminDashboardTabsProps> = ({
  activeTab,
  setActiveTab,
  businessCount,
  showBusinessFormDialog,
  setShowBusinessFormDialog,
  showUploadDialog,
  setShowUploadDialog,
  currentBusinessToEdit,
  isSubmitting,
  handleBusinessFormSubmit,
  handleUploadComplete,
  handleAddBusiness,
  handleEditBusiness,
  handlePermissionError,
  onViewDetails,
  businesses,
  isRefreshing,
  refreshBusinesses,
  onRefreshUsers
}) => {
  return (
    <>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4 flex w-full justify-start overflow-x-auto">
          <TabsTrigger value="businesses" className="relative">
            Businesses
            {businessCount > 0 && (
              <Badge className="ml-2 bg-primary text-primary-foreground" variant="outline">
                {businessCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
          <TabsTrigger value="business-dashboards">Business Dashboards</TabsTrigger>
          <TabsTrigger value="influencer-dashboards">Influencer Dashboards</TabsTrigger>
        </TabsList>

        <TabsContent value="businesses" className="space-y-4">
          <div className="flex justify-between mb-4">
            <h2 className="text-xl font-bold">Business Listings</h2>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowUploadDialog(true)}>
                <Upload className="h-4 w-4 mr-2" />
                Upload CSV
              </Button>
              <Button onClick={handleAddBusiness}>
                <UserPlus className="h-4 w-4 mr-2" />
                Add Business
              </Button>
              <Button
                variant="outline"
                onClick={refreshBusinesses}
                disabled={isRefreshing}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>
          </div>
          
          <BusinessesTab 
            businesses={businesses}
            onViewDetails={onViewDetails}
            onEdit={handleEditBusiness}
            isLoading={isRefreshing}
          />
        </TabsContent>

        <TabsContent value="users">
          <div className="flex justify-between mb-4">
            <h2 className="text-xl font-bold">User Permissions</h2>
            <Button 
              variant="outline" 
              onClick={onRefreshUsers}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Users
            </Button>
          </div>
          <UserPermissionsTab onRefresh={onRefreshUsers} />
        </TabsContent>

        <TabsContent value="subscriptions">
          <h2 className="text-xl font-bold mb-4">Subscription Management</h2>
          <SubscriptionManagement />
        </TabsContent>

        <TabsContent value="business-dashboards">
          <h2 className="text-xl font-bold mb-4">Business Dashboards</h2>
          <AdminBusinessDashboards 
            onPermissionError={handlePermissionError}
          />
        </TabsContent>

        <TabsContent value="influencer-dashboards">
          <h2 className="text-xl font-bold mb-4">Influencer Dashboards</h2>
          <AdminInfluencerDashboards 
            onPermissionError={handlePermissionError} 
          />
        </TabsContent>
      </Tabs>

      {showBusinessFormDialog && (
        <BusinessFormDialog
          onClose={() => setShowBusinessFormDialog(false)}
          onSubmit={handleBusinessFormSubmit}
          business={currentBusinessToEdit}
          isSubmitting={isSubmitting}
        />
      )}

      {showUploadDialog && (
        <CSVUploadDialog
          onClose={() => setShowUploadDialog(false)}
          onUploadComplete={handleUploadComplete}
        />
      )}
    </>
  );
};

export default AdminDashboardTabs;
