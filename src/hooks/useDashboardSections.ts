
import { useState, useEffect, useCallback } from "react";
import { SubscriptionPackage, ISubscriptionPackage } from "@/models/SubscriptionPackage";
import { User, IUser } from "@/models/User";
import { connectToMongoDB } from "@/config/mongodb";
import { useToast } from "./use-toast";
import { extractQueryData } from "@/utils/queryHelpers";

// Define some default sections
const DEFAULT_BUSINESS_SECTIONS = [
  "marketing", "reels", "creatives", "ratings", "seo", "google_listing", "growth", "leads", "reach"
];

const DEFAULT_INFLUENCER_SECTIONS = [
  "marketing", "reels", "creatives", "reach", "audience", "growth", "engagement", "content"
];

interface UseDashboardSectionsProps {
  selectedUser?: IUser | null;
}

export const useDashboardSections = ({ selectedUser }: UseDashboardSectionsProps) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>("user");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  
  // User sections state
  const [userSections, setUserSections] = useState<string[]>([]);
  const [availableSections, setAvailableSections] = useState<string[]>([]);
  
  // Package sections state
  const [packages, setPackages] = useState<ISubscriptionPackage[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<string>("");
  const [packageSections, setPackageSections] = useState<string[]>([]);
  
  // Load data based on active tab and selected user/package
  useEffect(() => {
    if (activeTab === "user" && selectedUser) {
      loadUserSections();
    } else if (activeTab === "package") {
      loadPackages();
    }
  }, [activeTab, selectedUser, selectedPackage]);
  
  // Load user sections
  const loadUserSections = useCallback(async () => {
    if (!selectedUser) return;
    
    setIsLoading(true);
    setLoadingMessage("Loading user dashboard sections...");
    setError(null);
    
    try {
      // Determine available sections based on user role
      const userRole = selectedUser.role || "Business";
      const availableSectionsList = userRole === "Influencer"
        ? DEFAULT_INFLUENCER_SECTIONS
        : DEFAULT_BUSINESS_SECTIONS;
      
      setAvailableSections(availableSectionsList);
      
      // Get user's current sections
      const currentSections = selectedUser.customDashboardSections || [];
      setUserSections(currentSections);
    } catch (err) {
      console.error("Error loading user sections:", err);
      setError("Failed to load user dashboard sections");
    } finally {
      setIsLoading(false);
    }
  }, [selectedUser]);
  
  // Load subscription packages
  const loadPackages = useCallback(async () => {
    setIsLoading(true);
    setLoadingMessage("Loading subscription packages...");
    setError(null);
    
    try {
      await connectToMongoDB();
      
      const packageQuery = SubscriptionPackage.find();
      const packagesData = extractQueryData<ISubscriptionPackage>(packageQuery);
      
      setPackages(packagesData);
      
      if (packagesData.length > 0 && !selectedPackage) {
        setSelectedPackage(packagesData[0].id);
        
        // Load sections for the first package
        const pkg = packagesData[0];
        setPackageSections(pkg.dashboardSections || []);
        
        // Set available sections based on package type
        const availableSectionsList = pkg.type === "Influencer"
          ? DEFAULT_INFLUENCER_SECTIONS
          : DEFAULT_BUSINESS_SECTIONS;
        
        setAvailableSections(availableSectionsList);
      } else if (selectedPackage) {
        // Load sections for the selected package
        const pkg = packagesData.find(p => p.id === selectedPackage);
        if (pkg) {
          setPackageSections(pkg.dashboardSections || []);
          
          // Set available sections based on package type
          const availableSectionsList = pkg.type === "Influencer"
            ? DEFAULT_INFLUENCER_SECTIONS
            : DEFAULT_BUSINESS_SECTIONS;
          
          setAvailableSections(availableSectionsList);
        }
      }
    } catch (err) {
      console.error("Error loading packages:", err);
      setError("Failed to load subscription packages");
    } finally {
      setIsLoading(false);
    }
  }, [selectedPackage]);
  
  // Toggle a user dashboard section
  const toggleUserSection = (section: string) => {
    if (userSections.includes(section)) {
      setUserSections(userSections.filter(s => s !== section));
    } else {
      setUserSections([...userSections, section]);
    }
  };
  
  // Toggle a package dashboard section
  const togglePackageSection = (section: string) => {
    if (packageSections.includes(section)) {
      setPackageSections(packageSections.filter(s => s !== section));
    } else {
      setPackageSections([...packageSections, section]);
    }
  };
  
  // Save user sections
  const saveUserSections = async () => {
    if (!selectedUser) return;
    
    setIsLoading(true);
    setLoadingMessage("Saving user dashboard sections...");
    
    try {
      await connectToMongoDB();
      
      const userToUpdate = await User.findOne({ uid: selectedUser.uid });
      if (!userToUpdate) {
        throw new Error("User not found");
      }
      
      // Update user dashboard sections
      await User.updateOne(
        { uid: selectedUser.uid },
        { $set: { customDashboardSections: userSections } }
      );
      
      toast({
        title: "Dashboard Sections Updated",
        description: "User dashboard sections have been updated successfully",
      });
    } catch (err) {
      console.error("Error saving user sections:", err);
      setError("Failed to save user dashboard sections");
      
      toast({
        title: "Error",
        description: "Failed to save user dashboard sections",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Save package sections
  const savePackageSections = async () => {
    if (!selectedPackage) return;
    
    setIsLoading(true);
    setLoadingMessage("Saving package dashboard sections...");
    
    try {
      await connectToMongoDB();
      
      // Update package dashboard sections
      await SubscriptionPackage.updateOne(
        { id: selectedPackage },
        { $set: { dashboardSections: packageSections } }
      );
      
      toast({
        title: "Package Sections Updated",
        description: "Subscription package dashboard sections have been updated successfully",
      });
    } catch (err) {
      console.error("Error saving package sections:", err);
      setError("Failed to save package dashboard sections");
      
      toast({
        title: "Error",
        description: "Failed to save package dashboard sections",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Refresh data based on active tab
  const refreshData = useCallback(() => {
    if (activeTab === "user" && selectedUser) {
      loadUserSections();
    } else if (activeTab === "package") {
      loadPackages();
    }
  }, [activeTab, selectedUser, loadUserSections, loadPackages]);
  
  return {
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
  };
};
