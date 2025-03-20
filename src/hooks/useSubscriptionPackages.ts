
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
  type?: string;
  initialOfflineMode?: boolean;
}

export const useSubscriptionPackages = (options: UseSubscriptionPackagesOptions = {}) => {
  const [packages, setPackages] = useState<ISubscriptionPackage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<any>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'error' | 'offline'>('connecting');
  const { toast } = useToast();

  // Function to fetch packages
  const fetchPackages = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setConnectionStatus('connecting');
    
    try {
      // Check if server is running
      const serverAvailable = await isServerRunning();
      
      if (!serverAvailable) {
        console.error("Server not available");
        setConnectionStatus('error');
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
      setPackages(fetchedPackages || []);
      setConnectionStatus('connected');
    } catch (err) {
      console.error('Error fetching packages:', err);
      setError(err instanceof Error ? err.message : 'Failed to load subscription packages');
      setConnectionStatus('error');
    } finally {
      setIsLoading(false);
    }
  }, [options.type]);

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

  return {
    packages,
    isLoading,
    error,
    connectionStatus,
    retryConnection: fetchPackages,
    fetchPackages,
    addOrUpdatePackage,
    removePackage
  };
};
