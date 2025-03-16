
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminBusinessDashboards from "./AdminBusinessDashboards";
import AdminInfluencerDashboards from "./AdminInfluencerDashboards";
import UserDashboardCustomizer from "./UserDashboardCustomizer";
import DashboardSectionsManager from "./DashboardSectionsManager";
import { Separator } from "@/components/ui/separator";

const AdminDashboardTabs = () => {
  return (
    <Tabs defaultValue="business" className="w-full max-w-full">
      <TabsList className="grid grid-cols-4 mb-8 overflow-x-auto">
        <TabsTrigger value="business">Business Dashboards</TabsTrigger>
        <TabsTrigger value="influencer">Influencer Dashboards</TabsTrigger>
        <TabsTrigger value="customize">Customize Dashboards</TabsTrigger>
        <TabsTrigger value="subscriptions">Dashboard Packages</TabsTrigger>
      </TabsList>
      
      <TabsContent value="business" className="w-full max-w-full overflow-hidden">
        <AdminBusinessDashboards />
      </TabsContent>
      
      <TabsContent value="influencer" className="w-full max-w-full overflow-hidden">
        <AdminInfluencerDashboards />
      </TabsContent>
      
      <TabsContent value="customize" className="w-full max-w-full overflow-hidden">
        <UserDashboardCustomizer />
      </TabsContent>
      
      <TabsContent value="subscriptions" className="w-full max-w-full overflow-hidden">
        <div className="space-y-4 w-full max-w-full">
          <h2 className="text-2xl font-bold">Dashboard Subscription Packages</h2>
          <p className="text-muted-foreground max-w-full break-words">
            Configure which dashboard features are included in each subscription package
          </p>
          <Separator className="my-4" />
          <DashboardSectionsManager />
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default AdminDashboardTabs;
