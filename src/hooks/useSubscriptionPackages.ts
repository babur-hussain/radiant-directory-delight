
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
        console.log("No user role provided");
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
          console.log(`Using 'Business' packages for role: ${userRole}`);
        }
        
        try {
          // Get packages for the specific role from MongoDB
          const rolePackages = await fetchSubscriptionPackagesByType(role);
          
          if (rolePackages && rolePackages.length > 0) {
            // Ensure all packages have required fields for display
            const formattedPackages = rolePackages.map(pkg => ({
              ...pkg,
              shortDescription: pkg.shortDescription || pkg.title || '',
              fullDescription: pkg.fullDescription || pkg.shortDescription || '',
              features: Array.isArray(pkg.features) ? pkg.features : [],
              durationMonths: pkg.durationMonths || 12,
              title: pkg.title || 'Subscription Package',
            }));
            
            setPackages(formattedPackages);
            console.log(`Loaded ${formattedPackages.length} ${role} packages from MongoDB`);
          } else {
            console.warn(`No ${role} packages found in MongoDB`);
            setPackages([]);
          }
        } catch (dbErr) {
          console.error('Error loading packages from MongoDB:', dbErr);
          setError('Failed to load subscription packages from database');
          setPackages([]);
        }
      } catch (err) {
        console.error('Error in subscription packages hook:', err);
        setError('Failed to load subscription packages. Please try again later.');
        setPackages([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadPackages();
  }, [userRole]);

  return { packages, isLoading, error };
};
