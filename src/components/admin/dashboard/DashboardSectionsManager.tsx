
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import SubscriptionError from "../subscription/SubscriptionError";
import UserSectionsList from "./UserSectionsList";
import PackageSectionsList from "./PackageSectionsList";
import { useDashboardSections } from "@/hooks/useDashboardSections";

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

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center p-6">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
          <p>{loadingMessage}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Dashboard Sections Manager</CardTitle>
        <CardDescription>
          Customize which dashboard elements are visible to users and included in subscription packages
        </CardDescription>
      </CardHeader>
      
      <CardContent>
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
          
          <TabsContent value="user" className="space-y-4">
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
          
          <TabsContent value="package" className="space-y-4">
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
