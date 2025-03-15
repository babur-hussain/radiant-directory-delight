
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import BusinessesTab from "./BusinessesTab";
import UserSubscriptionMapping from "../UserSubscriptionMapping";
import { Business } from "@/lib/csv-utils";
import BusinessFormDialog from "../BusinessFormDialog";
import CSVUploadDialog from "../CSVUploadDialog";
import { BusinessFormValues } from "../BusinessForm";
import { UserPermissionsTab } from "../UserPermissionsTab";
import { CentralizedSubscriptionManager } from "../subscription/CentralizedSubscriptionManager";

interface AdminDashboardTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  businessCount?: number;
  businesses?: Business[];
  showBusinessFormDialog: boolean;
  setShowBusinessFormDialog: (show: boolean) => void;
  showUploadDialog: boolean;
  setShowUploadDialog: (show: boolean) => void;
  currentBusinessToEdit: Business | null;
  isSubmitting: boolean;
  isRefreshing?: boolean;
  refreshBusinesses?: () => void;
  handleBusinessFormSubmit: (values: BusinessFormValues) => Promise<void>;
  handleUploadComplete: (success: boolean, message: string, count?: number) => void;
  handleAddBusiness: () => void;
  handleEditBusiness: (business: Business) => void;
  handlePermissionError: (error: any) => void;
  onViewDetails?: (business: Business) => void;
  onRefreshUsers?: () => void;
}

const AdminDashboardTabs: React.FC<AdminDashboardTabsProps> = ({
  activeTab,
  setActiveTab,
  businessCount = 0,
  businesses = [],
  showBusinessFormDialog,
  setShowBusinessFormDialog,
  showUploadDialog,
  setShowUploadDialog,
  currentBusinessToEdit,
  isSubmitting,
  isRefreshing = false,
  refreshBusinesses = () => {},
  handleBusinessFormSubmit,
  handleUploadComplete,
  handleAddBusiness,
  handleEditBusiness,
  handlePermissionError,
  onViewDetails,
  onRefreshUsers
}) => {
  return (
    <>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="businesses">
            Businesses ({businessCount})
          </TabsTrigger>
          <TabsTrigger value="users">
            Users
          </TabsTrigger>
          <TabsTrigger value="subscriptions">
            Subscriptions
          </TabsTrigger>
          <TabsTrigger value="assignments">
            User Assignments
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="businesses">
          <BusinessesTab 
            businesses={businesses}
            isRefreshing={isRefreshing}
            onRefresh={refreshBusinesses}
            handleAddBusiness={handleAddBusiness}
            handleEditBusiness={handleEditBusiness}
            onViewDetails={onViewDetails}
          />
        </TabsContent>
        
        <TabsContent value="users">
          <Card>
            <CardContent className="pt-6">
              <UserPermissionsTab 
                onPermissionError={handlePermissionError}
                onRefresh={onRefreshUsers}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="subscriptions">
          <CentralizedSubscriptionManager />
        </TabsContent>
        
        <TabsContent value="assignments">
          <Card>
            <CardContent className="pt-6">
              <UserSubscriptionMapping onPermissionError={handlePermissionError} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Business Form Dialog */}
      <BusinessFormDialog
        show={showBusinessFormDialog}
        onClose={() => setShowBusinessFormDialog(false)}
        onSubmit={handleBusinessFormSubmit}
        initialData={currentBusinessToEdit}
        isSubmitting={isSubmitting}
      />
      
      {/* CSV Upload Dialog */}
      <CSVUploadDialog 
        show={showUploadDialog}
        onClose={() => setShowUploadDialog(false)}
        onUploadComplete={handleUploadComplete}
      />
    </>
  );
};

export default AdminDashboardTabs;
