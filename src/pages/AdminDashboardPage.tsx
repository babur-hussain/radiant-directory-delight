
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import UnauthorizedView from "@/components/admin/UnauthorizedView";
import { SubscriptionManagement } from "@/components/admin/SubscriptionManagement";
import UserPermissionsTab from "@/components/admin/UserPermissionsTab";
import { TableBusinessListings } from "@/components/admin/TableBusinessListings";
import ManageCategoriesLocations from "@/components/admin/ManageCategoriesLocations";

const AdminDashboardPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("businesses");

  // Check if user is authorized (admin or staff)
  const isAuthorized = user && (user.role === "Admin" || user.role === "staff");

  if (!isAuthorized) {
    return <UnauthorizedView />;
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      
      <Tabs defaultValue="businesses" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="businesses">Businesses</TabsTrigger>
          <TabsTrigger value="categories-locations">Categories & Locations</TabsTrigger>
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
          <TabsTrigger value="users">User Permissions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="businesses" className="pt-6">
          <TableBusinessListings />
        </TabsContent>
        
        <TabsContent value="categories-locations" className="pt-6">
          <ManageCategoriesLocations />
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
