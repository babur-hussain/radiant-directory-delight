
import { useState, useEffect } from 'react';
import { UserRole } from '@/contexts/AuthContext';
import { ISubscriptionPackage } from '@/models/SubscriptionPackage';
import { fetchSubscriptionPackagesByType } from '@/lib/mongodb-utils';

export const useSubscriptionPackages = (userRole: UserRole) => {
  const [packages, setPackages] = useState<ISubscriptionPackage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPackages = async () => {
      if (!userRole) {
        setPackages([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        console.log(`Loading subscription packages for role: ${userRole}`);
        
        // Convert UserRole to expected type
        const role: "Business" | "Influencer" = 
          userRole === "Business" || userRole === "Influencer" 
            ? userRole 
            : "Business"; // Default to Business for other roles
        
        // Get packages for the specific role from MongoDB
        const rolePackages = await fetchSubscriptionPackagesByType(role);
        
        if (rolePackages && rolePackages.length > 0) {
          setPackages(rolePackages);
          console.log(`Loaded ${rolePackages.length} ${role} packages from MongoDB`);
        } else {
          console.warn(`No ${role} packages found in MongoDB`);
          setError(`No subscription packages available for ${role} role`);
        }
      } catch (err) {
        console.error('Error loading subscription packages:', err);
        setError('Failed to load subscription packages. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    loadPackages();
  }, [userRole]);

  return { packages, isLoading, error };
};
