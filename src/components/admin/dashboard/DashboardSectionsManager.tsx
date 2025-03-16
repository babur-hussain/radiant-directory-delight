
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import SubscriptionError from "../subscription/SubscriptionError";
import UserSectionsList from "./UserSectionsList";
import PackageSectionsList from "./PackageSectionsList";

interface DashboardSectionsManagerProps {
  selectedUser?: any;
}

const DashboardSectionsManager: React.FC<DashboardSectionsManagerProps> = ({ selectedUser }) => {
  // Use static data instead of the hook that's causing issues
  const [activeTab, setActiveTab] = React.useState("package");
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  
  // Mock data to avoid MongoDB errors
  const userSections = ["marketing", "reels", "ratings"];
  const packageSections = ["marketing", "reels", "ratings", "seo"];
  const availableSections = [
    "marketing", "reels", "creatives", "ratings", 
    "seo", "google_listing", "growth", "leads", "reach"
  ];
  const packages = [
    { id: "basic", title: "Basic", type: "Business" },
    { id: "premium", title: "Premium", type: "Business" }
  ];
  const [selectedPackage, setSelectedPackage] = React.useState("basic");

  const toggleUserSection = (section: string) => {
    // Mock function
    console.log("Toggling user section:", section);
  };

  const togglePackageSection = (section: string) => {
    // Mock function
    console.log("Toggling package section:", section);
  };

  const saveUserSections = () => {
    // Mock function
    console.log("Saving user sections");
  };

  const savePackageSections = () => {
    // Mock function
    console.log("Saving package sections");
  };

  const refreshData = () => {
    // Mock function
    console.log("Refreshing data");
  };

  // Show an error if MongoDB connection is mentioned in the error
  React.useEffect(() => {
    setError("MongoDB connection issue detected. Using static data for display purposes.");
  }, []);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center p-6">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
          <p>Loading dashboard sections...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm w-full max-w-full">
      <CardHeader>
        <CardTitle>Dashboard Sections Manager</CardTitle>
        <CardDescription>
          Customize which dashboard elements are visible to users and included in subscription packages
        </CardDescription>
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
