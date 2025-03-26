
import React, { useState, useEffect } from "react";
import { useDashboardSections } from "@/hooks/useDashboardSections";
import { useSubscription } from "@/hooks/useSubscription";
import { Card, CardContent } from "@/components/ui/card";
import { ISubscriptionPackage } from "@/models/SubscriptionPackage";
import { useSubscriptionPackages } from "@/hooks/useSubscriptionPackages";
import AdminPermissionError from "./AdminPermissionError";
import PackageSectionsList from "./PackageSectionsList";
import { toast } from "@/hooks/use-toast";
import { IUser } from "@/models/User";
import { savePackage } from "@/services/packageService";

interface DashboardSectionsManagerProps {
  userId: string;
  isAdmin: boolean;
  selectedUser?: IUser;
}

const DashboardSectionsManager: React.FC<DashboardSectionsManagerProps> = ({ userId, isAdmin, selectedUser }) => {
  const { loading: subscriptionLoading, error: subscriptionError, fetchUserSubscription } = useSubscription();
  const { sections, loading: sectionsLoading, error: sectionsError } = useDashboardSections();
  const { packages, isLoading: packagesLoading, isError } = useSubscriptionPackages();
  
  const [selectedPackage, setSelectedPackage] = useState<string>("");
  const [currentPackageSections, setCurrentPackageSections] = useState<string[]>([]);
  const [availableSections, setAvailableSections] = useState<string[]>([]);
  const [permissionError, setPermissionError] = useState<string>("");
  const [isSaving, setIsSaving] = useState<boolean>(false);
  
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
  
  useEffect(() => {
    if (packages && packages.length > 0 && !selectedPackage) {
      setSelectedPackage(packages[0].id);
    }
  }, [packages, selectedPackage]);
  
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
      
      console.log("Saving package with sections:", currentPackageSections);
      
      // Ensure we have required properties for ISubscriptionPackage
      const updatedPackage = {
        ...pkg,
        dashboardSections: currentPackageSections,
        paymentType: pkg.paymentType || 'recurring' // Ensure paymentType is defined
      } as ISubscriptionPackage;
      
      console.log("Updating package:", JSON.stringify(updatedPackage, null, 2));
      
      const savedPackage = await savePackage(updatedPackage);
      
      console.log("Save result:", savedPackage);
      
      toast({
        title: "Success",
        description: "Package dashboard sections updated successfully",
        variant: "default"
      });
      
      // Attempt to refetch if available
      if (typeof (useSubscriptionPackages as any).refetch === 'function') {
        await (useSubscriptionPackages as any).refetch();
      }
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
              packages={packages as unknown as ISubscriptionPackage[]}
              selectedPackage={selectedPackage}
              setSelectedPackage={handleSelectPackage}
              packageSections={currentPackageSections}
              availableSections={availableSections}
              togglePackageSection={togglePackageSection}
              savePackageSections={savePackageSections}
              refreshData={() => {}}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardSectionsManager;
