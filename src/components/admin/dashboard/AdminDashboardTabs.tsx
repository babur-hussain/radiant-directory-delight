
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminBusinessDashboards from "./AdminBusinessDashboards";
import AdminInfluencerDashboards from "./AdminInfluencerDashboards";
import UserDashboardCustomizer from "./UserDashboardCustomizer";
import DashboardSectionsManager from "./DashboardSectionsManager";
import { Separator } from "@/components/ui/separator";
import { LayoutDashboard, Users, Gauge, Package } from "lucide-react";

const AdminDashboardTabs = () => {
  return (
    <Tabs defaultValue="business" className="w-full max-w-full">
      <TabsList className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 mb-8 overflow-x-auto p-1 gap-1">
        <TabsTrigger value="business" className="flex items-center gap-2">
          <LayoutDashboard className="h-4 w-4" />
          <span className="hidden sm:inline">Business Dashboards</span>
          <span className="sm:hidden">Business</span>
        </TabsTrigger>
        <TabsTrigger value="influencer" className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          <span className="hidden sm:inline">Influencer Dashboards</span>
          <span className="sm:hidden">Influencer</span>
        </TabsTrigger>
        <TabsTrigger value="customize" className="flex items-center gap-2">
          <Gauge className="h-4 w-4" />
          <span className="hidden sm:inline">Customize Dashboards</span>
          <span className="sm:hidden">Customize</span>
        </TabsTrigger>
        <TabsTrigger value="subscriptions" className="flex items-center gap-2">
          <Package className="h-4 w-4" />
          <span className="hidden sm:inline">Dashboard Packages</span>
          <span className="sm:hidden">Packages</span>
        </TabsTrigger>
      </TabsList>
      
      <div className="px-1 md:px-0">
        <TabsContent value="business" className="w-full max-w-full overflow-hidden mt-0">
          <AdminBusinessDashboards />
        </TabsContent>
        
        <TabsContent value="influencer" className="w-full max-w-full overflow-hidden mt-0">
          <AdminInfluencerDashboards />
        </TabsContent>
        
        <TabsContent value="customize" className="w-full max-w-full overflow-hidden mt-0">
          <UserDashboardCustomizer />
        </TabsContent>
        
        <TabsContent value="subscriptions" className="w-full max-w-full overflow-hidden mt-0">
          <div className="space-y-4 w-full max-w-full">
            <h2 className="text-xl font-bold">Dashboard Subscription Packages</h2>
            <p className="text-muted-foreground max-w-full break-words">
              Configure which dashboard features are included in each subscription package
            </p>
            <Separator className="my-4" />
            <DashboardSectionsManager />
          </div>
        </TabsContent>
      </div>
    </Tabs>
  );
};

export default AdminDashboardTabs;
