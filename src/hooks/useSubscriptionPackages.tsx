
import { useState, useEffect, useCallback } from 'react';
import { toast } from './use-toast';
import { 
  fetchSubscriptionPackages, 
  fetchSubscriptionPackagesByType,
  saveSubscriptionPackage,
  deleteSubscriptionPackage
} from '@/lib/mongodb-utils';
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
      
      // Update local state
      setPackages(prevPackages => {
        const index = prevPackages.findIndex(p => p.id === savedPackage.id);
        if (index >= 0) {
          // Update existing package
          return [
            ...prevPackages.slice(0, index),
            savedPackage,
            ...prevPackages.slice(index + 1)
          ];
        } else {
          // Add new package
          return [...prevPackages, savedPackage];
        }
      });
      
      // Cache the updated packages in localStorage for offline fallback
      setTimeout(() => {
        localStorage.setItem('cachedSubscriptionPackages', JSON.stringify([...packages, savedPackage]));
      }, 100);
      
      toast({
        title: 'Success',
        description: `Package "${savedPackage.title}" has been saved.`,
      });
      
      return savedPackage;
    } catch (err) {
      console.error('Error saving package:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to save subscription package';
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [packages]);

  const removePackage = useCallback(async (packageId: string) => {
    try {
      setIsLoading(true);
      console.log('Deleting package:', packageId);
      
      await deleteSubscriptionPackage(packageId);
      
      // Update local state
      setPackages(prevPackages => prevPackages.filter(p => p.id !== packageId));
      
      // Update localStorage cache
      setTimeout(() => {
        localStorage.setItem('cachedSubscriptionPackages', JSON.stringify(packages.filter(p => p.id !== packageId)));
      }, 100);
      
      toast({
        title: 'Success',
        description: 'Package has been deleted.',
      });
      
      return true;
    } catch (err) {
      console.error('Error deleting package:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete subscription package';
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [packages]);

  const refreshPackages = useCallback(() => {
    return fetchPackages();
  }, [fetchPackages]);

  return {
    packages,
    isLoading,
    error,
    offlineMode,
    addOrUpdatePackage,
    removePackage,
    refreshPackages
  };
};
