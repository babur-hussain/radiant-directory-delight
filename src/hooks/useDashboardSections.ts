import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { connectToMongoDB } from "@/config/mongodb";
import { SubscriptionPackage } from "@/models/SubscriptionPackage";
import { extractQueryData } from "@/utils/queryHelpers";
import {
  BUSINESS_DASHBOARD_SECTIONS,
  INFLUENCER_DASHBOARD_SECTIONS,
  getUserDashboardSections,
  updateUserDashboardSections,
  updatePackageDashboardSections
} from "@/utils/dashboardSections";

interface UseDashboardSectionsProps {
  selectedUser?: any;
}

export const useDashboardSections = ({ selectedUser }: UseDashboardSectionsProps) => {
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

  useEffect(() => {
    if (selectedUser) {
      loadUserSections(selectedUser.uid || selectedUser.id);
      loadAvailableSections(selectedUser.role || "Business");
    } else {
      loadPackages();
    }
  }, [selectedUser]);

  useEffect(() => {
    if (selectedPackage) {
      loadPackageSections(selectedPackage);
    }
  }, [selectedPackage]);

  const loadUserSections = async (userId: string) => {
    if (!userId) return;
    
    setIsLoading(true);
    setLoadingMessage("Loading user dashboard sections...");
    try {
      const userRole = selectedUser?.role || "Business";
      const sections = await getUserDashboardSections(userId, userRole);
      setUserSections(sections);
    } catch (err) {
      console.error("Error loading user sections:", err);
      setError("Failed to load user dashboard sections");
      
      setUserSections([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadPackageSections = async (packageId: string) => {
    if (!packageId) return;
    
    setIsLoading(true);
    setLoadingMessage("Loading package dashboard sections...");
    try {
      await connectToMongoDB();
      const packageData = await SubscriptionPackage.findOne({ id: packageId });
      if (packageData) {
        setPackageSections(packageData.dashboardSections || []);
        const role = packageData.type || "Business";
        loadAvailableSections(role);
      } else {
        setPackageSections([]);
        setError("Package not found");
      }
    } catch (err) {
      console.error("Error loading package sections:", err);
      setError("Failed to load package dashboard sections");
      
      setPackageSections([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAvailableSections = (role: string) => {
    const sections = role.toLowerCase() === "business" || role === "Business" 
      ? BUSINESS_DASHBOARD_SECTIONS 
      : INFLUENCER_DASHBOARD_SECTIONS;
    setAvailableSections(sections);
  };

  const loadPackages = async () => {
    setIsLoading(true);
    setLoadingMessage("Loading subscription packages...");
    try {
      await connectToMongoDB();
      const packagesQuery = await SubscriptionPackage.find();
      
      const allPackages = extractQueryData(packagesQuery);
      
      if (allPackages && allPackages.length > 0) {
        setPackages(allPackages);
        if (!selectedPackage) {
          setSelectedPackage(allPackages[0].id);
        }
      } else {
        setPackages([]);
        setError("No subscription packages found");
      }
    } catch (err) {
      console.error("Error loading packages:", err);
      setError("Failed to load subscription packages");
      
      setPackages([]);
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
      const userId = selectedUser.uid || selectedUser.id;
      const success = await updateUserDashboardSections(userId, userSections);
      
      if (success) {
        toast({
          title: "Success",
          description: "User dashboard sections updated successfully",
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
    setError(null);
    if (activeTab === "user" && selectedUser) {
      const userId = selectedUser.uid || selectedUser.id;
      loadUserSections(userId);
    } else if (activeTab === "package") {
      loadPackages();
      if (selectedPackage) {
        loadPackageSections(selectedPackage);
      }
    }
  };

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
