
import { useState, useEffect, useCallback } from 'react';
import { useToast } from './use-toast';
import { ISubscriptionPackage } from '@/models/SubscriptionPackage';
import { 
  fetchSubscriptionPackages, 
  fetchSubscriptionPackagesByType,
  saveSubscriptionPackage,
  deleteSubscriptionPackage,
  isServerRunning
} from '@/lib/mongodb/subscriptionUtils';

export interface UseSubscriptionPackagesOptions {
  initialOfflineMode?: boolean;
  type?: string;
}

export const useSubscriptionPackages = (options: UseSubscriptionPackagesOptions = {}) => {
  const [packages, setPackages] = useState<ISubscriptionPackage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<any>(null);
  const [isOffline, setIsOffline] = useState<boolean>(options.initialOfflineMode || false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'error' | 'offline'>(
    options.initialOfflineMode ? 'offline' : 'connecting'
  );
  const { toast } = useToast();

  // Function to fetch packages
  const fetchPackages = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setConnectionStatus('connecting');
    
    try {
      // Check if server is running
      const serverAvailable = await isServerRunning();
      setIsOffline(!serverAvailable);
      
      if (!serverAvailable) {
        console.warn("Server not available, using cached data");
        const cachedPackages = localStorage.getItem('cachedSubscriptionPackages');
        if (cachedPackages) {
          setPackages(JSON.parse(cachedPackages));
          console.log('Using cached packages from localStorage');
        }
        setConnectionStatus('offline');
        throw new Error("Server not available");
      }
      
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
      setConnectionStatus('connected');
      
      // Cache packages in localStorage for offline access
      localStorage.setItem('cachedSubscriptionPackages', JSON.stringify(fetchedPackages));
    } catch (err) {
      console.error('Error fetching packages:', err);
      setError(err instanceof Error ? err.message : 'Failed to load subscription packages');
      setConnectionStatus('error');
      
      if (!isOffline) {
        setIsOffline(true);
        
        // Try to use localStorage as fallback if not already tried
        try {
          const cachedPackages = localStorage.getItem('cachedSubscriptionPackages');
          if (cachedPackages) {
            setPackages(JSON.parse(cachedPackages));
            console.log('Using cached packages from localStorage');
          }
        } catch (cacheErr) {
          console.error('Error loading cached packages:', cacheErr);
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, [options.type, isOffline]);

  const addOrUpdatePackage = useCallback(async (packageData: ISubscriptionPackage) => {
    try {
      setIsLoading(true);
      console.log('Saving package:', packageData);
      
      // Check if server is available before attempting to save
      const serverAvailable = await isServerRunning();
      if (!serverAvailable) {
        throw new Error("Server is not available. Cannot save package.");
      }
      
      // Validate required fields before saving
      if (!packageData.title) throw new Error("Package title is required");
      if (!packageData.shortDescription) throw new Error("Short description is required");
      if (!packageData.fullDescription) throw new Error("Full description is required");
      
      // Set or validate price
      if (packageData.price === undefined || packageData.price === null) {
        packageData.price = 999; // Default price
      }
      
      // Save the package to MongoDB
      const savedPackage = await saveSubscriptionPackage(packageData);
      console.log('Package saved successfully:', savedPackage);
      
      // Update local state with the saved package
      setPackages(prevPackages => {
        const existingIndex = prevPackages.findIndex(p => p.id === savedPackage.id);
        if (existingIndex >= 0) {
          // Update existing package
          const updatedPackages = [...prevPackages];
          updatedPackages[existingIndex] = savedPackage;
          return updatedPackages;
        } else {
          // Add new package
          return [...prevPackages, savedPackage];
        }
      });
      
      // Update cache in localStorage
      const updatedCache = [...packages];
      const existingCacheIndex = updatedCache.findIndex(p => p.id === savedPackage.id);
      if (existingCacheIndex >= 0) {
        updatedCache[existingCacheIndex] = savedPackage;
      } else {
        updatedCache.push(savedPackage);
      }
      localStorage.setItem('cachedSubscriptionPackages', JSON.stringify(updatedCache));
      
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
      
      // Check if server is available
      const serverAvailable = await isServerRunning();
      if (!serverAvailable) {
        throw new Error("Server is not available. Cannot delete package.");
      }
      
      // Delete the package from MongoDB
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

  // Initialize data
  useEffect(() => {
    fetchPackages();
  }, [fetchPackages]);

  // For backward compatibility, include both isOffline and offlineMode
  return {
    packages,
    isLoading,
    error,
    isOffline,
    offlineMode: isOffline, // For backward compatibility
    connectionStatus,
    retryConnection: fetchPackages,
    fetchPackages,
    addOrUpdatePackage,
    removePackage
  };
};
