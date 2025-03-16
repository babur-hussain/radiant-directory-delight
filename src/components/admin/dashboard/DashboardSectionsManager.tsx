
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Save, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { BUSINESS_DASHBOARD_SECTIONS, INFLUENCER_DASHBOARD_SECTIONS, getUserDashboardSections, updateUserDashboardSections, updatePackageDashboardSections } from "@/utils/dashboardSections";
import { SubscriptionPackage } from "@/models/SubscriptionPackage";
import { connectToMongoDB } from "@/config/mongodb";
import SubscriptionError from "../subscription/SubscriptionError";

interface DashboardSectionsManagerProps {
  selectedUser?: any;
}

const DashboardSectionsManager: React.FC<DashboardSectionsManagerProps> = ({ selectedUser }) => {
  const [activeTab, setActiveTab] = useState("user");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [userSections, setUserSections] = useState<string[]>([]);
  const [packageSections, setPackageSections] = useState<string[]>([]);
  const [availableSections, setAvailableSections] = useState<string[]>([]);
  const [packages, setPackages] = useState<any[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Load data when user or package changes
  useEffect(() => {
    if (selectedUser) {
      loadUserSections(selectedUser.id);
      loadAvailableSections(selectedUser.role || "Business");
    }
    loadPackages();
  }, [selectedUser]);

  // Load sections when package changes
  useEffect(() => {
    if (selectedPackage) {
      loadPackageSections(selectedPackage);
    }
  }, [selectedPackage]);

  const loadUserSections = async (userId: string) => {
    setIsLoading(true);
    setLoadingMessage("Loading user dashboard sections...");
    try {
      const sections = await getUserDashboardSections(userId);
      setUserSections(sections);
    } catch (err) {
      console.error("Error loading user sections:", err);
      setError("Failed to load user dashboard sections");
    } finally {
      setIsLoading(false);
    }
  };

  const loadPackageSections = async (packageId: string) => {
    setIsLoading(true);
    setLoadingMessage("Loading package dashboard sections...");
    try {
      await connectToMongoDB();
      const packageData = await SubscriptionPackage.findOne({ id: packageId });
      if (packageData) {
        setPackageSections(packageData.dashboardSections || []);
        // Set available sections based on package type
        const role = packageData.type;
        setAvailableSections(role === "Business" ? BUSINESS_DASHBOARD_SECTIONS : INFLUENCER_DASHBOARD_SECTIONS);
      }
    } catch (err) {
      console.error("Error loading package sections:", err);
      setError("Failed to load package dashboard sections");
    } finally {
      setIsLoading(false);
    }
  };

  const loadAvailableSections = (role: string) => {
    setAvailableSections(role === "Business" ? BUSINESS_DASHBOARD_SECTIONS : INFLUENCER_DASHBOARD_SECTIONS);
  };

  const loadPackages = async () => {
    setIsLoading(true);
    setLoadingMessage("Loading subscription packages...");
    try {
      await connectToMongoDB();
      const allPackages = await SubscriptionPackage.find().sort({ title: 1 });
      setPackages(allPackages);
      if (allPackages.length > 0 && !selectedPackage) {
        setSelectedPackage(allPackages[0].id);
      }
    } catch (err) {
      console.error("Error loading packages:", err);
      setError("Failed to load subscription packages");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleUserSection = (section: string) => {
    if (userSections.includes(section)) {
      setUserSections(userSections.filter(s => s !== section));
    } else {
      setUserSections([...userSections, section]);
    }
  };

  const togglePackageSection = (section: string) => {
    if (packageSections.includes(section)) {
      setPackageSections(packageSections.filter(s => s !== section));
    } else {
      setPackageSections([...packageSections, section]);
    }
  };

  const saveUserSections = async () => {
    if (!selectedUser) return;
    
    setIsLoading(true);
    setLoadingMessage("Saving user dashboard sections...");
    try {
      const success = await updateUserDashboardSections(selectedUser.id, userSections);
      if (success) {
        toast({
          title: "Success",
          description: "User dashboard sections updated successfully",
          variant: "success",
        });
      } else {
        throw new Error("Failed to update user dashboard sections");
      }
    } catch (err) {
      console.error("Error saving user sections:", err);
      setError("Failed to save user dashboard sections");
      toast({
        title: "Error",
        description: "Failed to update user dashboard sections",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const savePackageSections = async () => {
    if (!selectedPackage) return;
    
    setIsLoading(true);
    setLoadingMessage("Saving package dashboard sections...");
    try {
      const success = await updatePackageDashboardSections(selectedPackage, packageSections);
      if (success) {
        toast({
          title: "Success",
          description: "Package dashboard sections updated successfully",
          variant: "success",
        });
      } else {
        throw new Error("Failed to update package dashboard sections");
      }
    } catch (err) {
      console.error("Error saving package sections:", err);
      setError("Failed to save package dashboard sections");
      toast({
        title: "Error",
        description: "Failed to update package dashboard sections",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const refreshData = () => {
    if (activeTab === "user" && selectedUser) {
      loadUserSections(selectedUser.id);
    } else if (activeTab === "package" && selectedPackage) {
      loadPackageSections(selectedPackage);
    }
  };

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
    <Card>
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
            {selectedUser ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-medium">
                      Dashboard sections for {selectedUser.name || selectedUser.email}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Role: {selectedUser.role || "Not specified"}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={refreshData}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>
                
                <Separator className="my-4" />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {availableSections.map((section) => (
                    <div key={section} className="flex items-center justify-between space-x-2 p-2 border rounded">
                      <Label htmlFor={`user-${section}`} className="flex-1 cursor-pointer">
                        {section.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Label>
                      <Switch
                        id={`user-${section}`}
                        checked={userSections.includes(section)}
                        onCheckedChange={() => toggleUserSection(section)}
                      />
                    </div>
                  ))}
                </div>
                
                <div className="flex justify-end mt-4">
                  <Button onClick={saveUserSections}>
                    <Save className="h-4 w-4 mr-2" />
                    Save User Settings
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center p-6">
                <p>Please select a user to manage their dashboard sections</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="package" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-medium">
                  Dashboard sections for subscription packages
                </h3>
                <p className="text-sm text-muted-foreground">
                  Define which dashboard sections are included in each package
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={refreshData}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
            
            <Select value={selectedPackage} onValueChange={setSelectedPackage}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a package" />
              </SelectTrigger>
              <SelectContent>
                {packages.map((pkg) => (
                  <SelectItem key={pkg.id} value={pkg.id}>
                    {pkg.title} ({pkg.type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Separator className="my-4" />
            
            {selectedPackage && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {availableSections.map((section) => (
                    <div key={section} className="flex items-center justify-between space-x-2 p-2 border rounded">
                      <Label htmlFor={`package-${section}`} className="flex-1 cursor-pointer">
                        {section.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Label>
                      <Switch
                        id={`package-${section}`}
                        checked={packageSections.includes(section)}
                        onCheckedChange={() => togglePackageSection(section)}
                      />
                    </div>
                  ))}
                </div>
                
                <div className="flex justify-end mt-4">
                  <Button onClick={savePackageSections}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Package Settings
                  </Button>
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default DashboardSectionsManager;
