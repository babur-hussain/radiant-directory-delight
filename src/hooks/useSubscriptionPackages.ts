
import { useState, useEffect } from 'react';
import { fetchSubscriptionPackagesByType } from '@/lib/mongodb-utils';
import { ISubscriptionPackage } from '@/models/SubscriptionPackage';
import { SubscriptionPackage, convertToSubscriptionPackage } from '@/data/subscriptionData';
import { UserRole } from '@/contexts/AuthContext';

export const useSubscriptionPackages = (userRole: UserRole | string) => {
  const [packages, setPackages] = useState<SubscriptionPackage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPackages = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        console.log(`Loading subscription packages for role: ${userRole}`);
        
        // Convert userRole to appropriate type format for API
        // For business page, we need to ensure it always passes "Business" as the type
        const type = userRole === 'Admin' 
          ? 'Business' 
          : userRole === 'Influencer' 
            ? 'Influencer' 
            : 'Business';
        
        console.log(`Fetching packages for type: ${type}`);
        const fetchedPackages = await fetchSubscriptionPackagesByType(type as "Business" | "Influencer");
        console.log(`Fetched ${fetchedPackages.length} ${type} packages:`, fetchedPackages);
        
        if (!fetchedPackages || fetchedPackages.length === 0) {
          console.log(`No ${type} packages found`);
          setPackages([]);
        } else {
          // Convert to SubscriptionPackage type
          const convertedPackages = fetchedPackages.map(pkg => convertToSubscriptionPackage(pkg));
          console.log('Converted packages:', convertedPackages);
          setPackages(convertedPackages);
        }
      } catch (err) {
        console.error('Error loading subscription packages:', err);
        setError(err instanceof Error ? err.message : 'Failed to load subscription packages');
      } finally {
        setIsLoading(false);
      }
    };

    loadPackages();
  }, [userRole]);

  return { packages, isLoading, error };
};
