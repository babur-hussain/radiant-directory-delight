
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import SubscriptionError from "../subscription/SubscriptionError";
import UserSectionsList from "./UserSectionsList";
import PackageSectionsList from "./PackageSectionsList";
import { connectToMongoDB } from "@/config/mongodb";
import { ISubscriptionPackage } from "@/models/SubscriptionPackage";
import { User } from "@/models/User";
import { useDashboardSections } from "@/hooks/useDashboardSections";

// Define available dashboard sections
const BUSINESS_SECTIONS = [
  "marketing", "reels", "creatives", "ratings", 
  "seo", "google_listing", "growth", "leads", "reach"
];

const INFLUENCER_SECTIONS = [
  "marketing", "reels", "creatives", "reach", 
  "audience", "growth", "engagement", "content"
];

interface DashboardSectionsManagerProps {
  selectedUser?: any;
}

const DashboardSectionsManager: React.FC<DashboardSectionsManagerProps> = ({ selectedUser }) => {
  const {
    activeTab,
    setActiveTab,
    isLoading,
    loadingMessage,
    userSections,
    packageSections,
    availableSections,
    packages,
    selectedPackage,
    setSelectedPackage,
    error,
    setError,
    toggleUserSection,
    togglePackageSection,
    saveUserSections,
    savePackageSections,
    refreshData
  } = useDashboardSections({ selectedUser });
  
  // Load data based on selected user or tab
  useEffect(() => {
    if (selectedUser) {
      // Set active tab to user when user is selected
      setActiveTab("user");
    }
  }, [selectedUser, setActiveTab]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center p-6">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
          <p>{loadingMessage || "Loading dashboard sections..."}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm w-full max-w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Dashboard Sections Manager</CardTitle>
          <CardDescription>
            Customize which dashboard elements are visible to users and included in subscription packages
          </CardDescription>
        </div>
        <Button
          variant="outline"
          onClick={refreshData}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </CardHeader>
      
      <CardContent className="w-full max-w-full">
        {error && <SubscriptionError error={error} onRetry={refreshData} />}
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="user" disabled={!selectedUser}>
              User Dashboard
            </TabsTrigger>
            <TabsTrigger value="package">
              Subscription Packages
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="user" className="space-y-4 w-full max-w-full">
            <UserSectionsList
              selectedUser={selectedUser}
              userSections={userSections}
              availableSections={availableSections}
              isLoading={isLoading}
              toggleUserSection={toggleUserSection}
              saveUserSections={saveUserSections}
              refreshData={refreshData}
            />
          </TabsContent>
          
          <TabsContent value="package" className="space-y-4 w-full max-w-full">
            <PackageSectionsList
              packages={packages}
              selectedPackage={selectedPackage}
              setSelectedPackage={setSelectedPackage}
              packageSections={packageSections}
              availableSections={availableSections}
              togglePackageSection={togglePackageSection}
              savePackageSections={savePackageSections}
              refreshData={refreshData}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default DashboardSectionsManager;
