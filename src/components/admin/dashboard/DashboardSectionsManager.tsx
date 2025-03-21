
import React, { useState, useEffect } from "react";
import { useDashboardSections } from "@/hooks/useDashboardSections";
import { useSubscription } from "@/hooks/useSubscription";
import { Card, CardContent } from "@/components/ui/card";
import { savePackage, getPackageById } from "@/services/packageService";
import { ISubscriptionPackage } from "@/models/SubscriptionPackage";
import { useSubscriptionPackages } from "@/hooks/useSubscriptionPackages";
import AdminPermissionError from "./AdminPermissionError";
import PackageSectionsList from "./PackageSectionsList";
import { toast } from "@/hooks/use-toast";
import { IUser } from "@/models/User";

interface DashboardSectionsManagerProps {
  userId: string;
  isAdmin: boolean;
  selectedUser?: IUser;
}

const DashboardSectionsManager: React.FC<DashboardSectionsManagerProps> = ({ userId, isAdmin, selectedUser }) => {
  const { subscription, loading: subscriptionLoading, error: subscriptionError } = useSubscription(userId);
  const { dashboardSections, isLoading: sectionsLoading, error: sectionsError } = useDashboardSections(userId);
  const { packages, isLoading: packagesLoading, error: packagesError, refetch } = useSubscriptionPackages();
  
  const [selectedPackage, setSelectedPackage] = useState<string>("");
  const [currentPackageSections, setCurrentPackageSections] = useState<string[]>([]);
  const [availableSections, setAvailableSections] = useState<string[]>([]);
  const [permissionError, setPermissionError] = useState<string>("");
  const [isSaving, setIsSaving] = useState<boolean>(false);
  
  // Populate available dashboard sections
  useEffect(() => {
    const allSections = [
      'seo_optimization',
      'google_business',
      'reels_and_ads',
      'marketing_campaigns',
      'business_ratings',
      'creative_designs',
      'leads_and_inquiries',
      'reach_and_visibility',
      'growth_analytics',
      'influencer_rank',
      'performance_metrics',
      'leads_generated',
      'ratings_reviews',
      'creatives_tracker',
      'reels_progress',
      'seo_progress',
      'google_listing_status'
    ];
    
    setAvailableSections(allSections);
  }, []);
  
  // Set selected package when packages are loaded
  useEffect(() => {
    if (packages && packages.length > 0 && !selectedPackage) {
      setSelectedPackage(packages[0].id);
    }
  }, [packages, selectedPackage]);
  
  // Load package sections when selected package changes
  useEffect(() => {
    if (selectedPackage && packages) {
      const pkg = packages.find(p => p.id === selectedPackage);
      if (pkg) {
        setCurrentPackageSections(pkg.dashboardSections || []);
      }
    }
  }, [selectedPackage, packages]);
  
  const handleSelectPackage = (packageId: string) => {
    setSelectedPackage(packageId);
  };
  
  const togglePackageSection = (section: string) => {
    if (currentPackageSections.includes(section)) {
      setCurrentPackageSections(prev => prev.filter(s => s !== section));
    } else {
      setCurrentPackageSections(prev => [...prev, section]);
    }
  };
  
  const savePackageSections = async () => {
    try {
      setIsSaving(true);
      
      if (!selectedPackage) {
        toast({
          title: "Error",
          description: "No package selected",
          variant: "destructive"
        });
        return;
      }
      
      const pkg = packages.find(p => p.id === selectedPackage);
      if (!pkg) {
        toast({
          title: "Error",
          description: "Selected package not found",
          variant: "destructive"
        });
        return;
      }
      
      // Log for debugging
      console.log("Saving package with sections:", currentPackageSections);
      
      // Update package with new sections
      const updatedPackage: ISubscriptionPackage = {
        ...pkg,
        dashboardSections: currentPackageSections
      };
      
      // Log the updatedPackage to see what we're sending
      console.log("Updating package:", JSON.stringify(updatedPackage, null, 2));
      
      const savedPackage = await savePackage(updatedPackage);
      
      console.log("Save result:", savedPackage);
      
      toast({
        title: "Success",
        description: "Package dashboard sections updated successfully",
        variant: "default"
      });
      
      // Refresh packages
      await refetch();
    } catch (error) {
      console.error("Error saving package sections:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      setPermissionError(errorMessage);
      toast({
        title: "Error",
        description: `Failed to save package sections: ${errorMessage}`,
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const dismissError = () => {
    setPermissionError("");
  };
  
  return (
    <div className="space-y-4">
      {permissionError && (
        <AdminPermissionError 
          permissionError={permissionError} 
          dismissError={dismissError} 
        />
      )}
      
      <Card>
        <CardContent className="pt-6">
          {(subscriptionLoading || sectionsLoading || packagesLoading) ? (
            <div className="py-8 text-center text-muted-foreground">Loading dashboard sections...</div>
          ) : (
            <PackageSectionsList
              packages={packages}
              selectedPackage={selectedPackage}
              setSelectedPackage={handleSelectPackage}
              packageSections={currentPackageSections}
              availableSections={availableSections}
              togglePackageSection={togglePackageSection}
              savePackageSections={savePackageSections}
              refreshData={refetch}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardSectionsManager;
