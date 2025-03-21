
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import DashboardSectionsManager from "./DashboardSectionsManager";
import UserDashboardCustomizer from "./UserDashboardCustomizer";

const AdminDashboardTabs = () => {
  const { user, isAdmin } = useAuth();

  if (!user) {
    return <div>Loading user data...</div>;
  }

  return (
    <Tabs defaultValue="packages" className="w-full">
      <TabsList className="grid w-full grid-cols-2 bg-card">
        <TabsTrigger value="packages">Package Sections</TabsTrigger>
        <TabsTrigger value="users">User Customization</TabsTrigger>
      </TabsList>
      
      <TabsContent value="packages" className="py-4">
        <DashboardSectionsManager 
          userId={user.uid}
          isAdmin={isAdmin}
        />
      </TabsContent>
      
      <TabsContent value="users" className="py-4">
        <UserDashboardCustomizer />
      </TabsContent>
    </Tabs>
  );
};

export default AdminDashboardTabs;
