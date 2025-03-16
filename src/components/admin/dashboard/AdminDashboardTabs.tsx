
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminBusinessDashboards from "./AdminBusinessDashboards";
import AdminInfluencerDashboards from "./AdminInfluencerDashboards";
import UserDashboardCustomizer from "./UserDashboardCustomizer";
import { Separator } from "@/components/ui/separator";

const AdminDashboardTabs = () => {
  return (
    <Tabs defaultValue="business" className="w-full">
      <TabsList className="grid grid-cols-4 mb-8">
        <TabsTrigger value="business">Business Dashboards</TabsTrigger>
        <TabsTrigger value="influencer">Influencer Dashboards</TabsTrigger>
        <TabsTrigger value="customize">Customize Dashboards</TabsTrigger>
        <TabsTrigger value="subscriptions">Dashboard Packages</TabsTrigger>
      </TabsList>
      
      <TabsContent value="business">
        <AdminBusinessDashboards />
      </TabsContent>
      
      <TabsContent value="influencer">
        <AdminInfluencerDashboards />
      </TabsContent>
      
      <TabsContent value="customize">
        <UserDashboardCustomizer />
      </TabsContent>
      
      <TabsContent value="subscriptions">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Dashboard Subscription Packages</h2>
          <p className="text-muted-foreground">
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
