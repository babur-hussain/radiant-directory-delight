
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const AdminBusinessDashboards = () => {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Business Dashboards</h2>
      <p className="text-muted-foreground">
        Configure and manage business dashboards
      </p>

      <Card>
        <CardHeader>
          <CardTitle>Business Dashboard Overview</CardTitle>
          <CardDescription>
            Manage customization options for business dashboards
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>
            This section allows you to customize how the dashboard appears for all businesses.
            To customize individual business dashboards, use the Dashboard Customization tab.
          </p>
        </CardContent>
      </Card>

      <Tabs defaultValue="elements" className="w-full">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="elements">Dashboard Elements</TabsTrigger>
          <TabsTrigger value="defaults">Default Layouts</TabsTrigger>
          <TabsTrigger value="advanced">Advanced Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="elements">
          <Card>
            <CardContent className="p-6">
              <p>Configure which dashboard elements are available for businesses.</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="defaults">
          <Card>
            <CardContent className="p-6">
              <p>Set default dashboard layouts for business accounts.</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="advanced">
          <Card>
            <CardContent className="p-6">
              <p>Configure advanced settings for business dashboards.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminBusinessDashboards;
