
import { useState, useEffect } from "react";
import { businessPackages, influencerPackages } from "@/data/subscriptionData";
import { fetchSubscriptionPackagesByType } from "@/lib/mongodb-utils";
import { UserRole } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { ISubscriptionPackage } from "@/models/SubscriptionPackage";

export const useSubscriptionPackages = (role: UserRole) => {
  const [packages, setPackages] = useState<ISubscriptionPackage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const loadPackages = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        console.log("Fetching subscription packages for role:", role);
        
        // Determine package type based on user role
        const packageType = role === "Business" ? "Business" : "Influencer";
        
        // Fetch packages by type directly from MongoDB
        const fetchedPackages = await fetchSubscriptionPackagesByType(packageType);
        console.log(`Fetched ${fetchedPackages.length} ${packageType} packages from MongoDB`);
        
        // If no packages found for the role, use default packages
        if (fetchedPackages.length === 0) {
          console.log("No packages found in MongoDB, using default packages");
          const defaultPackages = role === "Business" ? businessPackages : influencerPackages;
          
          // Set default packages
          setPackages(defaultPackages);
          
          // Show toast notification
          toast({
            title: "Using Default Packages",
            description: "No packages found in MongoDB. Using default packages.",
          });
        } else {
          // Store fetched packages from MongoDB
          setPackages(fetchedPackages);
        }
      } catch (err) {
        console.error("Error fetching subscription packages:", err);
        
        // Check if this is a MongoDB connection error
        const errorMessage = err instanceof Error ? err.message : String(err);
        const isMongoError = errorMessage.toLowerCase().includes('mongo') || 
                            errorMessage.toLowerCase().includes('database') ||
                            errorMessage.toLowerCase().includes('connection');
        
        if (isMongoError) {
          setError("Could not connect to MongoDB. Using default packages instead.");
          
          // Show database error toast
          toast({
            title: "Database Connection Error",
            description: "Could not connect to MongoDB. Using default packages instead.",
            variant: "destructive",
          });
        } else {
          setError("Failed to load packages. Using default packages instead.");
          
          // Show general error toast
          toast({
            title: "Error Loading Packages",
            description: "Failed to load packages from database. Using default packages instead.",
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
