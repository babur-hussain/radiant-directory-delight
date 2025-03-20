
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
import { getLocalFallbackPackages } from '@/lib/mongodb/serverUtils';

export interface UseSubscriptionPackagesOptions {
  type?: string;
  initialOfflineMode?: boolean;
}

export const useSubscriptionPackages = (options: UseSubscriptionPackagesOptions = {}) => {
  const [packages, setPackages] = useState<ISubscriptionPackage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<any>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'error' | 'offline'>('connecting');
  const { toast } = useToast();
  const [retryCount, setRetryCount] = useState(0);
  
  // Function to fetch packages
  const fetchPackages = useCallback(async (forceFallback = false) => {
    setIsLoading(true);
    setError(null);
    
    if (!forceFallback) {
      setConnectionStatus('connecting');
    }
    
    try {
      // Check if server is running
      const serverAvailable = forceFallback ? false : await isServerRunning();
      
      if (!serverAvailable) {
        console.log("Server not available, using fallback data");
        setConnectionStatus('offline');
        
        // Get fallback data
        const fallbackPackages = getLocalFallbackPackages(options.type);
        setPackages(fallbackPackages);
        setIsLoading(false);
        return;
      }
      
      // Server is available, try to get real data
      console.log("Server is available, fetching real package data");
      
      // Get packages based on type or get all
      let fetchedPackages: ISubscriptionPackage[];
      
      try {
        if (options.type) {
          console.log(`Fetching packages for type: ${options.type}`);
          fetchedPackages = await fetchSubscriptionPackagesByType(options.type as "Business" | "Influencer");
        } else {
          console.log('Fetching all packages');
          fetchedPackages = await fetchSubscriptionPackages();
        }
        
        console.log(`Successfully fetched ${fetchedPackages?.length || 0} packages from MongoDB:`, fetchedPackages);
        
        // Ensure we have valid array of packages
        if (!Array.isArray(fetchedPackages)) {
          console.warn("Received non-array response for packages:", fetchedPackages);
          fetchedPackages = [];
        }
        
        // If we got packages, use them
        if (fetchedPackages.length > 0) {
          setPackages(fetchedPackages);
          setConnectionStatus('connected');
          setIsLoading(false);
          return;
        }
        
        // If we got no packages, show error
        console.warn("No packages returned from server");
        setError("No subscription packages found in database");
        setConnectionStatus('error');
        setPackages([]);
      } catch (fetchError) {
        console.error("Error fetching packages from MongoDB:", fetchError);
        setError(fetchError instanceof Error ? fetchError.message : 'Failed to fetch subscription packages');
        setConnectionStatus('error');
        setPackages([]);
      }
    } catch (err) {
      console.error('Error checking server availability:', err);
      setError(err instanceof Error ? err.message : 'Failed to connect to server');
      setConnectionStatus('error');
      setPackages([]);
    } finally {
      setIsLoading(false);
    }
  }, [options.type]);

  const retryConnection = useCallback(() => {
    setRetryCount(prev => prev + 1);
    return fetchPackages(false);
  }, [fetchPackages]);

  const addOrUpdatePackage = useCallback(async (packageData: ISubscriptionPackage) => {
    try {
      setIsLoading(true);
      console.log('Saving package:', packageData);
      
      // Validate required fields before proceeding
      if (!packageData) {
        throw new Error("No package data provided");
      }
      
      if (!packageData.title) {
        packageData.title = "Untitled Package";
      }
      
      if (!packageData.type) {
        throw new Error("Package type is required");
      }
      
      if (!packageData.shortDescription) {
        packageData.shortDescription = packageData.title;
      }
      
      if (!packageData.fullDescription) {
        packageData.fullDescription = packageData.shortDescription;
      }
      
      // Check if server is available before attempting to save
      const serverAvailable = await isServerRunning();
      if (!serverAvailable) {
        console.error("Server is not available");
        setConnectionStatus('error');
        throw new Error("Server is not available");
      }
      
      // Set or validate price
      if (packageData.price === undefined || packageData.price === null) {
        packageData.price = 999; // Default price
      }
      
      // Ensure package ID is set
      if (!packageData.id) {
        packageData.id = `pkg_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      }
      
      // Save the package to MongoDB
      const savedPackage = await saveSubscriptionPackage(packageData);
      console.log('Package saved successfully:', savedPackage);
      
      // Update local state with the saved package
      setPackages(prevPackages => {
        // Make a safe copy of prevPackages (ensure it's an array)
        const safePackages = Array.isArray(prevPackages) ? [...prevPackages] : [];
        
        const existingIndex = safePackages.findIndex(p => p && p.id === savedPackage.id);
        if (existingIndex >= 0) {
          // Update existing package
          safePackages[existingIndex] = savedPackage;
          return safePackages;
        } else {
          // Add new package
          return [...safePackages, savedPackage];
        }
      });
      
      toast({
        title: "Success",
        description: `Package "${savedPackage.title}" has been saved.`,
      });
      
      // Ensure we fetch the latest data after saving
      await fetchPackages();
      
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
  }, [toast, fetchPackages]);

  const removePackage = useCallback(async (packageId: string) => {
    try {
      setIsLoading(true);
      console.log('Deleting package:', packageId);
      
      // Check if server is available
      const serverAvailable = await isServerRunning();
      if (!serverAvailable) {
        setConnectionStatus('error');
        throw new Error("Server not available");
      }
      
      // Delete the package from MongoDB
      await deleteSubscriptionPackage(packageId);
      
      // Update local state
      setPackages(prevPackages => {
        // Make a safe copy of prevPackages (ensure it's an array)
        const safePackages = Array.isArray(prevPackages) ? [...prevPackages] : [];
        return safePackages.filter(p => p && p.id !== packageId);
      });
      
      toast({
        title: "Success",
        description: "Package has been deleted."
      });
      
      // Refresh the packages after deletion
      await fetchPackages();
      
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
  }, [toast, fetchPackages]);

  // Initialize data
  useEffect(() => {
    fetchPackages();
  }, [fetchPackages, retryCount]);

  return {
    packages,
    isLoading,
    error,
    connectionStatus,
    retryConnection,
    fetchPackages,
    addOrUpdatePackage,
    removePackage
  };
};
