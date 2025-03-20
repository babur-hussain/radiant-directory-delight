
import { useState, useEffect, useCallback } from 'react';
import { useToast } from './use-toast';
import { 
  fetchSubscriptionPackages, 
  fetchSubscriptionPackagesByType,
  saveSubscriptionPackage,
  deleteSubscriptionPackage
} from '@/lib/mongodb/subscriptionUtils';
import { isServerRunning } from '@/api/mongoAPI';
import { ISubscriptionPackage } from '@/models/SubscriptionPackage';

interface UseSubscriptionPackagesOptions {
  type?: string;
  initialOfflineMode?: boolean;
}

export const useSubscriptionPackages = (options: UseSubscriptionPackagesOptions = {}) => {
  const [packages, setPackages] = useState<ISubscriptionPackage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [offlineMode, setOfflineMode] = useState<boolean>(options.initialOfflineMode || false);
  const { toast } = useToast();

  const fetchPackages = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Check if server is running
      const serverAvailable = await isServerRunning();
      setOfflineMode(!serverAvailable);
      
      // Get packages based on type or get all
      let fetchedPackages: ISubscriptionPackage[];
      
      if (options.type) {
        console.log(`Fetching packages for type: ${options.type}`);
        fetchedPackages = await fetchSubscriptionPackagesByType(options.type as "Business" | "Influencer");
      } else {
        console.log('Fetching all packages');
        fetchedPackages = await fetchSubscriptionPackages();
      }
      
      console.log(`Fetched ${fetchedPackages.length} packages:`, fetchedPackages);
      setPackages(fetchedPackages);
      
      // Cache packages in localStorage for offline access
      localStorage.setItem('cachedSubscriptionPackages', JSON.stringify(fetchedPackages));
    } catch (err) {
      console.error('Error fetching packages:', err);
      setError(err instanceof Error ? err.message : 'Failed to load subscription packages');
      setOfflineMode(true);
      
      // Try to use localStorage as fallback
      try {
        const cachedPackages = localStorage.getItem('cachedSubscriptionPackages');
        if (cachedPackages) {
          setPackages(JSON.parse(cachedPackages));
          console.log('Using cached packages from localStorage');
        }
      } catch (cacheErr) {
        console.error('Error loading cached packages:', cacheErr);
      }
    } finally {
      setIsLoading(false);
    }
  }, [options.type, options.initialOfflineMode]);

  useEffect(() => {
    fetchPackages();
  }, [fetchPackages]);

  const addOrUpdatePackage = useCallback(async (packageData: ISubscriptionPackage) => {
    try {
      setIsLoading(true);
      console.log('Saving package:', packageData);
      
      const savedPackage = await saveSubscriptionPackage(packageData);
      console.log('Package saved successfully:', savedPackage);
      
      // Update local state
      setPackages(prevPackages => {
        const existingIndex = prevPackages.findIndex(p => p.id === savedPackage.id);
        if (existingIndex >= 0) {
          // Update existing package
          return [
            ...prevPackages.slice(0, existingIndex),
            savedPackage,
            ...prevPackages.slice(existingIndex + 1)
          ];
        } else {
          // Add new package
          return [...prevPackages, savedPackage];
        }
      });
      
      // Update cache
      const updatedPackages = [...packages];
      const existingIndex = updatedPackages.findIndex(p => p.id === savedPackage.id);
      if (existingIndex >= 0) {
        updatedPackages[existingIndex] = savedPackage;
      } else {
        updatedPackages.push(savedPackage);
      }
      localStorage.setItem('cachedSubscriptionPackages', JSON.stringify(updatedPackages));
      
      toast({
        title: "Success",
        description: `Package "${savedPackage.title}" has been saved.`,
      });
      
      return savedPackage;
    } catch (err) {
      console.error('Error saving package:', err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'Failed to save subscription package',
        variant: "destructive"
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [packages, toast]);

  const removePackage = useCallback(async (packageId: string) => {
    try {
      setIsLoading(true);
      console.log('Deleting package:', packageId);
      
      await deleteSubscriptionPackage(packageId);
      
      // Update local state
      setPackages(prevPackages => prevPackages.filter(p => p.id !== packageId));
      
      // Update cache
      const updatedPackages = packages.filter(p => p.id !== packageId);
      localStorage.setItem('cachedSubscriptionPackages', JSON.stringify(updatedPackages));
      
      toast({
        title: "Success",
        description: "Package has been deleted."
      });
      
      return true;
    } catch (err) {
      console.error('Error deleting package:', err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'Failed to delete subscription package',
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [packages, toast]);

  return {
    packages,
    isLoading,
    error,
    offlineMode,
    fetchPackages,
    addOrUpdatePackage,
    removePackage
  };
};
