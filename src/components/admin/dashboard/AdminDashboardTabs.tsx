
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Business } from "@/lib/csv-utils";
import { BusinessFormValues } from "@/components/admin/BusinessForm";
import BusinessesTab from "./BusinessesTab";
import UserPermissionsTab from "../UserPermissionsTab";
import SubscriptionManagement from "../subscription/SubscriptionManagement";
import ManageCategoriesLocations from "../ManageCategoriesLocations";
import AdminBusinessDashboards from "./AdminBusinessDashboards";
import AdminInfluencerDashboards from "./AdminInfluencerDashboards";

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
  refreshBusinesses: () => Promise<void>;
}

const AdminDashboardTabs: React.FC<AdminDashboardTabsProps> = ({
  activeTab,
  setActiveTab,
  businessCount,
  businesses,
  isRefreshing,
  refreshBusinesses,
  handleAddBusiness,
  handleEditBusiness,
  handlePermissionError,
  onViewDetails
}) => {
  return (
    <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-6">
      <TabsList className="flex flex-wrap h-auto gap-2 p-2">
        <TabsTrigger value="businesses" className="flex-grow sm:flex-initial">
          Businesses
          {businessCount > 0 && (
            <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium">
              {businessCount}
            </span>
          )}
        </TabsTrigger>
        <TabsTrigger value="users" className="flex-grow sm:flex-initial">
          Users & Permissions
        </TabsTrigger>
        <TabsTrigger value="subscriptions" className="flex-grow sm:flex-initial">
          Subscription Packages
        </TabsTrigger>
        <TabsTrigger value="categories" className="flex-grow sm:flex-initial">
          Categories & Locations
        </TabsTrigger>
        <TabsTrigger value="business_dashboards" className="flex-grow sm:flex-initial">
          Business Dashboards
        </TabsTrigger>
        <TabsTrigger value="influencer_dashboards" className="flex-grow sm:flex-initial">
          Influencer Dashboards
        </TabsTrigger>
      </TabsList>

      <TabsContent value="businesses" className="space-y-4">
        <BusinessesTab 
          businesses={businesses}
          onAddBusiness={handleAddBusiness}
          onEditBusiness={handleEditBusiness}
          isRefreshing={isRefreshing}
          onRefresh={refreshBusinesses}
          handlePermissionError={handlePermissionError}
        />
      </TabsContent>
      
      <TabsContent value="users" className="space-y-4">
        <UserPermissionsTab />
      </TabsContent>
      
      <TabsContent value="subscriptions" className="space-y-4">
        <SubscriptionManagement onPermissionError={handlePermissionError} />
      </TabsContent>
      
      <TabsContent value="categories" className="space-y-4">
        <ManageCategoriesLocations />
      </TabsContent>
      
      <TabsContent value="business_dashboards" className="space-y-4">
        <AdminBusinessDashboards />
      </TabsContent>
      
      <TabsContent value="influencer_dashboards" className="space-y-4">
        <AdminInfluencerDashboards 
          influencers={businesses.filter(b => b.category === "Influencer")}
          onEdit={handleEditBusiness}
        />
      </TabsContent>
    </Tabs>
  );
};

export default AdminDashboardTabs;
