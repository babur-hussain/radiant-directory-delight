
import { useState, useEffect } from "react";
import { SubscriptionPackage, businessPackages, influencerPackages } from "@/data/subscriptionData";
import { fetchSubscriptionPackages } from "@/lib/firebase-utils";
import { UserRole } from "@/contexts/AuthContext";

export const useSubscriptionPackages = (role: UserRole) => {
  const [packages, setPackages] = useState<SubscriptionPackage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPackages = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch packages from Firebase
        const allPackages = await fetchSubscriptionPackages();
        
        // Filter packages by role
        const roleType = role === "Business" ? "Business" : "Influencer";
        const filteredPackages = allPackages.filter(pkg => pkg.type === roleType);
        
        // If no packages found for the role, use default packages
        if (filteredPackages.length === 0) {
          setPackages(role === "Business" ? businessPackages : influencerPackages);
        } else {
          setPackages(filteredPackages);
        }
      } catch (err) {
        console.error("Error fetching subscription packages:", err);
        setError("Failed to load packages. Using default packages instead.");
        
        // Use default packages as fallback
        setPackages(role === "Business" ? businessPackages : influencerPackages);
      } finally {
        setIsLoading(false);
      }
    };

    if (role) {
      loadPackages();
    }
  }, [role]);

  return { packages, isLoading, error };
};
