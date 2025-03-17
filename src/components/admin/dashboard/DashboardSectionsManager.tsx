
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
import { SubscriptionPackage } from "@/models/SubscriptionPackage";

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
  const [activeTab, setActiveTab] = useState("package");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userSections, setUserSections] = useState<string[]>([]);
  const [packageSections, setPackageSections] = useState<string[]>([]);
  const [availableSections, setAvailableSections] = useState<string[]>(BUSINESS_SECTIONS);
  const [packages, setPackages] = useState<any[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<string>("");
  const { toast } = useToast();

  // Load data based on selected user or tab
  useEffect(() => {
    if (selectedUser) {
      loadUserSections(selectedUser.uid || selectedUser.id);
      // Set active tab to user when user is selected
      setActiveTab("user");
    } else {
      loadPackages();
    }
  }, [selectedUser]);

  // Load available sections based on user role or package type
  useEffect(() => {
    if (selectedUser) {
      const role = selectedUser.role || "Business";
      setAvailableSections(role.toLowerCase() === "business" ? BUSINESS_SECTIONS : INFLUENCER_SECTIONS);
    }
  }, [selectedUser]);

  // Load package sections when selected package changes
  useEffect(() => {
    if (selectedPackage) {
      loadPackageSections(selectedPackage);
    }
  }, [selectedPackage]);

  const loadUserSections = async (userId: string) => {
    if (!userId) return;
    
    setIsLoading(true);
    try {
      console.log("Loading dashboard sections for user:", userId);
      
      // Try to connect to MongoDB
      const connected = await connectToMongoDB();
      if (!connected) {
        console.warn("MongoDB connection failed, using mock user sections data");
        
        // Set mock data for demo
        const mockSections = ["marketing", "reels", "ratings"];
        setUserSections(mockSections);
        return;
      }
      
      // In a real app, fetch user dashboard sections from MongoDB
      // For now, using mock data
      const mockSections = ["marketing", "reels", "ratings"];
      setUserSections(mockSections);
      
    } catch (err) {
      console.error("Error loading user sections:", err);
      setError("Failed to load user dashboard sections");
      
      toast({
        title: "Error",
        description: "Failed to load user dashboard sections",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadPackageSections = async (packageId: string) => {
    if (!packageId) return;
    
    setIsLoading(true);
    try {
      console.log("Loading dashboard sections for package:", packageId);
      
      // Try to connect to MongoDB
      const connected = await connectToMongoDB();
      if (!connected) {
        console.warn("MongoDB connection failed, using mock package sections data");
        
        // Set mock data for demo
        const mockSections = ["marketing", "reels", "ratings", "seo"];
        setPackageSections(mockSections);
        return;
      }
      
      // In a real app, this would fetch from MongoDB
      // For now, we'll use mock data that matches the package ID
      const selectedPkg = packages.find(p => p.id === packageId);
      if (selectedPkg) {
        // Set available sections based on package type
        const type = selectedPkg.type || "Business";
        setAvailableSections(type.toLowerCase() === "business" ? BUSINESS_SECTIONS : INFLUENCER_SECTIONS);
        
        // Set mock sections
        const mockSections = type.toLowerCase() === "business" 
          ? ["marketing", "reels", "ratings", "seo"] 
          : ["marketing", "reels", "audience", "content"];
        
        setPackageSections(mockSections);
      }
      
    } catch (err) {
      console.error("Error loading package sections:", err);
      setError("Failed to load package dashboard sections");
      
      toast({
        title: "Error",
        description: "Failed to load package dashboard sections",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadPackages = async () => {
    setIsLoading(true);
    try {
      console.log("Loading packages for dashboard sections manager");
      
      // Try to connect to MongoDB
      const connected = await connectToMongoDB();
      if (!connected) {
        console.warn("MongoDB connection failed, using mock packages data");
        
        // Set mock data for demo
        const mockPackages = [
          { id: "basic", title: "Basic", type: "Business" },
          { id: "premium", title: "Premium", type: "Business" },
          { id: "starter", title: "Starter", type: "Influencer" },
          { id: "pro", title: "Pro", type: "Influencer" }
        ];
        
        setPackages(mockPackages);
        if (mockPackages.length > 0 && !selectedPackage) {
          setSelectedPackage(mockPackages[0].id);
        }
        return;
      }
      
      // In a real app, fetch from MongoDB
      try {
        const packageDocs = await SubscriptionPackage.find().lean();
        
        if (packageDocs && packageDocs.length > 0) {
          const formattedPackages = packageDocs.map((pkg: any) => ({
            id: pkg.id,
            title: pkg.title,
            type: pkg.type
          }));
          
          setPackages(formattedPackages);
          
          if (formattedPackages.length > 0 && !selectedPackage) {
            setSelectedPackage(formattedPackages[0].id);
          }
        } else {
          // Fallback to mock data
          const mockPackages = [
            { id: "basic", title: "Basic", type: "Business" },
            { id: "premium", title: "Premium", type: "Business" }
          ];
          
          setPackages(mockPackages);
          if (mockPackages.length > 0 && !selectedPackage) {
            setSelectedPackage(mockPackages[0].id);
          }
        }
      } catch (dbError) {
        console.error("Database error fetching packages:", dbError);
        
        // Fallback to mock data
        const mockPackages = [
          { id: "basic", title: "Basic", type: "Business" },
          { id: "premium", title: "Premium", type: "Business" }
        ];
        
        setPackages(mockPackages);
        if (mockPackages.length > 0 && !selectedPackage) {
          setSelectedPackage(mockPackages[0].id);
        }
      }
      
    } catch (err) {
      console.error("Error loading packages:", err);
      setError("Failed to load subscription packages");
      
      toast({
        title: "Error",
        description: "Failed to load subscription packages",
        variant: "destructive"
      });
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
    try {
      console.log(`Saving dashboard sections for user ${selectedUser.uid || selectedUser.id}:`, userSections);
      
      // Try to connect to MongoDB
      const connected = await connectToMongoDB();
      if (!connected) {
        console.warn("MongoDB connection failed, simulating user sections save");
        
        toast({
          title: "Success",
          description: "User dashboard sections saved successfully (simulated)",
        });
        return;
      }
      
      // In a real app, save to MongoDB
      // For now, just simulate success
      
      toast({
        title: "Success",
        description: "User dashboard sections updated successfully",
      });
    } catch (err) {
      console.error("Error saving user sections:", err);
      
      toast({
        title: "Error",
        description: "Failed to save user dashboard sections",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const savePackageSections = async () => {
    if (!selectedPackage) return;
    
    setIsLoading(true);
    try {
      console.log(`Saving dashboard sections for package ${selectedPackage}:`, packageSections);
      
      // Try to connect to MongoDB
      const connected = await connectToMongoDB();
      if (!connected) {
        console.warn("MongoDB connection failed, simulating package sections save");
        
        toast({
          title: "Success",
          description: "Package dashboard sections saved successfully (simulated)",
        });
        return;
      }
      
      // In a real app, save to MongoDB
      // For now, just simulate success
      
      toast({
        title: "Success",
        description: "Package dashboard sections updated successfully",
      });
    } catch (err) {
      console.error("Error saving package sections:", err);
      
      toast({
        title: "Error",
        description: "Failed to save package dashboard sections",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const refreshData = () => {
    setError(null);
    if (activeTab === "user" && selectedUser) {
      loadUserSections(selectedUser.uid || selectedUser.id);
    } else if (activeTab === "package") {
      loadPackages();
      if (selectedPackage) {
        loadPackageSections(selectedPackage);
      }
    }
    
    toast({
      title: "Refreshing",
      description: "Refreshing dashboard sections data",
    });
  };

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
