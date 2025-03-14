
import { useState, useEffect } from "react";
import { SubscriptionPackage, businessPackages, influencerPackages } from "@/data/subscriptionData";
import { fetchSubscriptionPackages } from "@/lib/firebase-utils";
import { UserRole } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export const useSubscriptionPackages = (role: UserRole) => {
  const [packages, setPackages] = useState<SubscriptionPackage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const loadPackages = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        console.log("Fetching subscription packages for role:", role);
        // Fetch packages from Firebase
        const allPackages = await fetchSubscriptionPackages();
        console.log("Fetched packages:", allPackages);
        
        // Filter packages by role
        const roleType = role === "Business" ? "Business" : "Influencer";
        const filteredPackages = allPackages.filter(pkg => pkg.type === roleType);
        console.log("Filtered packages for role", roleType, ":", filteredPackages);
        
        // If no packages found for the role, use default packages
        if (filteredPackages.length === 0) {
          console.log("No packages found for role, using default packages");
          setPackages(role === "Business" ? businessPackages : influencerPackages);
          
          // Show toast notification
          toast({
            title: "Using Default Packages",
            description: "No custom packages found. Showing default packages.",
          });
        } else {
          setPackages(filteredPackages);
        }
      } catch (err) {
        console.error("Error fetching subscription packages:", err);
        
        // Check if this is a permission error
        const errorMessage = err instanceof Error ? err.message : String(err);
        const isPermissionError = errorMessage.includes("Permission denied") || 
                                 errorMessage.includes("insufficient permissions");
        
        if (isPermissionError) {
          setError("Permission denied. Using default packages instead.");
          
          // Show permission error toast
          toast({
            title: "Permission Error",
            description: "You don't have access to view subscription packages. Using default packages.",
            variant: "destructive",
          });
        } else {
          setError("Failed to load packages. Using default packages instead.");
          
          // Show general error toast
          toast({
            title: "Error Loading Packages",
            description: "Failed to load custom packages. Using default packages instead.",
            variant: "destructive",
          });
        }
        
        // Use default packages as fallback
        setPackages(role === "Business" ? businessPackages : influencerPackages);
      } finally {
        setIsLoading(false);
      }
    };

    if (role) {
      loadPackages();
    }
  }, [role, toast]);

  return { packages, isLoading, error };
};
