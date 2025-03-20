
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
import { api } from '@/api/core/apiService';

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
      setPackages(fetchedPackages || []);
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
        console.warn("Server is not available. Using offline mode for saving package.");
        setIsOffline(true);
        setConnectionStatus('offline');
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
      
      // Even if server returns null, we should have a valid package from the saveSubscriptionPackage function
      // This acts as a fallback
      const effectivePackage = savedPackage || {
        ...packageData,
        updatedAt: new Date()
      };
      
      // Make sure the package has all required fields before updating state
      const finalPackage: ISubscriptionPackage = {
        id: effectivePackage.id || packageData.id || `pkg_${Date.now()}`,
        title: effectivePackage.title || packageData.title || 'Untitled Package',
        type: effectivePackage.type || packageData.type || 'Business',
        price: effectivePackage.price || packageData.price || 999,
        durationMonths: effectivePackage.durationMonths || packageData.durationMonths || 12,
        shortDescription: effectivePackage.shortDescription || packageData.shortDescription || '',
        fullDescription: effectivePackage.fullDescription || packageData.fullDescription || '',
        features: effectivePackage.features || packageData.features || [],
        popular: effectivePackage.popular || packageData.popular || false,
        paymentType: effectivePackage.paymentType || packageData.paymentType || 'recurring',
        // Include other fields from effectivePackage or packageData with defaults
        setupFee: effectivePackage.setupFee || packageData.setupFee || 0,
        billingCycle: effectivePackage.billingCycle || packageData.billingCycle || 'yearly',
        isActive: effectivePackage.isActive !== undefined ? effectivePackage.isActive : (packageData.isActive !== undefined ? packageData.isActive : true),
        maxBusinesses: effectivePackage.maxBusinesses || packageData.maxBusinesses || 1,
        maxInfluencers: effectivePackage.maxInfluencers || packageData.maxInfluencers || 1
      };
      
      // Update local state with the saved package
      setPackages(prevPackages => {
        // Make a safe copy of prevPackages (ensure it's an array)
        const safePackages = Array.isArray(prevPackages) ? [...prevPackages] : [];
        
        const existingIndex = safePackages.findIndex(p => p && p.id === finalPackage.id);
        if (existingIndex >= 0) {
          // Update existing package
          safePackages[existingIndex] = finalPackage;
          return safePackages;
        } else {
          // Add new package
          return [...safePackages, finalPackage];
        }
      });
      
      // Update cache in localStorage
      const updatedCache = Array.isArray(packages) ? [...packages] : [];
      const existingCacheIndex = updatedCache.findIndex(p => p && p.id === finalPackage.id);
      if (existingCacheIndex >= 0) {
        updatedCache[existingCacheIndex] = finalPackage;
      } else {
        updatedCache.push(finalPackage);
      }
      localStorage.setItem('cachedSubscriptionPackages', JSON.stringify(updatedCache));
      
      toast({
        title: "Success",
        description: `Package "${finalPackage.title}" has been saved.`,
      });
      
      return finalPackage;
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
        setIsOffline(true);
        setConnectionStatus('offline');
        console.warn("Server is not available. Using offline mode for deleting package.");
      }
      
      // Delete the package from MongoDB
      await deleteSubscriptionPackage(packageId);
      
      // Update local state
      setPackages(prevPackages => {
        // Make a safe copy of prevPackages (ensure it's an array)
        const safePackages = Array.isArray(prevPackages) ? [...prevPackages] : [];
        return safePackages.filter(p => p && p.id !== packageId);
      });
      
      // Update cache
      const updatedPackages = Array.isArray(packages) ? packages.filter(p => p && p.id !== packageId) : [];
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
