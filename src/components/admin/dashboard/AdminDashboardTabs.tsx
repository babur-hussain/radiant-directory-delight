
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BusinessesTab from "./BusinessesTab";
import { SubscriptionManagement } from "@/components/admin/SubscriptionManagement";
import { SubscriptionPackageManagement } from "@/components/admin/subscription/SubscriptionManagement";
import UserPermissionsTab from "@/components/admin/UserPermissionsTab";
import ManageCategoriesLocations from "@/components/admin/ManageCategoriesLocations";
import { BusinessFormValues } from "@/components/admin/BusinessForm";
import { Business } from "@/lib/csv-utils";

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
}

const AdminDashboardTabs = ({
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
  handlePermissionError
}: AdminDashboardTabsProps) => {
  return (
    <Tabs defaultValue="businesses" value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="businesses">Businesses</TabsTrigger>
        <TabsTrigger value="categories-locations">Categories & Locations</TabsTrigger>
        <TabsTrigger value="subscription-packages">Subscription Packages</TabsTrigger>
        <TabsTrigger value="subscriptions">Active Subscriptions</TabsTrigger>
        <TabsTrigger value="users">User Permissions</TabsTrigger>
      </TabsList>
      
      <TabsContent value="businesses" className="pt-6">
        <BusinessesTab 
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
  );
};

export default AdminDashboardTabs;
