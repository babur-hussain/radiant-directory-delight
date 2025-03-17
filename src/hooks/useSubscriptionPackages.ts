
import { useState, useEffect } from 'react';
import { UserRole } from '@/contexts/AuthContext';
import { ISubscriptionPackage } from '@/models/SubscriptionPackage';
import { fetchSubscriptionPackagesByType } from '@/lib/mongodb-utils';
import { businessPackages, influencerPackages } from '@/data/subscriptionData';

export const useSubscriptionPackages = (userRole: UserRole) => {
  const [packages, setPackages] = useState<ISubscriptionPackage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPackages = async () => {
      if (!userRole) {
        console.log("No user role provided, using default Business packages");
        setPackages(businessPackages);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        console.log(`Loading subscription packages for role: ${userRole}`);
        
        // Convert UserRole to expected type, handling all possible UserRole values
        let role: "Business" | "Influencer"; 
        
        if (userRole === "Business") {
          role = "Business";
        } else if (userRole === "Influencer") {
          role = "Influencer";
        } else {
          // Default to Business for Admin, User, staff, or any other role
          role = "Business";
          console.log(`Using default 'Business' packages for role: ${userRole}`);
        }
        
        try {
          // Get packages for the specific role from MongoDB
          const rolePackages = await fetchSubscriptionPackagesByType(role);
          
          if (rolePackages && rolePackages.length > 0) {
            setPackages(rolePackages);
            console.log(`Loaded ${rolePackages.length} ${role} packages from MongoDB`);
          } else {
            console.warn(`No ${role} packages found in MongoDB, falling back to static data`);
            // Fall back to static packages
            const staticPackages = role === "Influencer" ? influencerPackages : businessPackages;
            setPackages(staticPackages);
            console.log(`Loaded ${staticPackages.length} ${role} packages from static data`);
          }
        } catch (dbErr) {
          console.error('Error loading packages from MongoDB:', dbErr);
          // Fall back to static packages
          const staticPackages = role === "Influencer" ? influencerPackages : businessPackages;
          setPackages(staticPackages);
          console.log(`Loaded ${staticPackages.length} ${role} packages from static data due to DB error`);
        }
      } catch (err) {
        console.error('Error in subscription packages hook:', err);
        setError('Failed to load subscription packages. Please try again later.');
        
        // Fall back to static packages as a last resort
        const fallbackPackages = userRole === "Influencer" ? influencerPackages : businessPackages;
        setPackages(fallbackPackages);
        console.log(`Loaded ${fallbackPackages.length} fallback packages from static data`);
      } finally {
        setIsLoading(false);
      }
    };

    loadPackages();
  }, [userRole]);

  return { packages, isLoading, error };
};
