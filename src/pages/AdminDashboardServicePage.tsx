
import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import AdminInfluencerDashboards from "@/components/admin/dashboard/AdminInfluencerDashboards";
import AdminBusinessDashboards from "@/components/admin/dashboard/AdminBusinessDashboards";
import AccessDenied from "@/components/dashboard/AccessDenied";
import { useBusinessListings } from "@/hooks/useBusinessListings";

const AdminDashboardServicePage = () => {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState("influencers");
  const { businesses } = useBusinessListings();
  
  // Filter businesses to find influencers
  const influencers = businesses.filter(b => b.category === "Influencer");
  
  if (!isAuthenticated || !user?.isAdmin) {
    return <AccessDenied message="You need admin privileges to access this page" />;
  }
  
  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Services Management</h1>
        <p className="text-muted-foreground mt-2">
          Manage services displayed on user dashboards
        </p>
      </div>
      
      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab} 
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="influencers">Influencer Dashboards</TabsTrigger>
          <TabsTrigger value="businesses">Business Dashboards</TabsTrigger>
        </TabsList>
        
        <TabsContent value="influencers">
          <AdminInfluencerDashboards influencers={influencers} />
        </TabsContent>
        
        <TabsContent value="businesses">
          <AdminBusinessDashboards />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboardServicePage;
