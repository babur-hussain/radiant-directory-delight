import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ISubscriptionPackage } from '@/models/SubscriptionPackage';
import { getAllPackages, savePackage, deletePackage } from '@/services/packageService';
import { toast } from '@/hooks/use-toast';

// Updated fallback packages to display while loading
const fallbackPackages: ISubscriptionPackage[] = [
  // Influencer Packages
  {
    id: 'influencer-basic',
    title: 'Basic',
    price: 299,
    type: 'Influencer',
    features: ['Free profile creation', '6 video categories', 'Local business connections', '200 KM radius visibility'],
    shortDescription: '200 KM radius visibility',
    paymentType: 'recurring',
    billingCycle: 'monthly',
    popular: false
  },
  {
    id: 'influencer-pro',
    title: 'Pro',
    price: 499,
    type: 'Influencer',
    features: ['All Basic features', 'Higher exposure', 'More business connections', '450 KM radius visibility'],
    shortDescription: '450 KM radius visibility',
    paymentType: 'recurring',
    billingCycle: 'monthly',
    popular: true
  },
  {
    id: 'influencer-premium',
    title: 'Premium',
    price: 799,
    type: 'Influencer',
    features: ['All Pro features', 'Premium placement', 'Maximum earning potential', '1050 KM radius visibility'],
    shortDescription: '1050 KM radius visibility',
    paymentType: 'recurring',
    billingCycle: 'monthly',
    popular: false
  },
  // Business Package
  {
    id: 'business-local',
    title: 'Local Connect',
    price: 399,
    type: 'Business',
    features: ['Access to local influencer lists', 'Category-based recommendations', 'Virtual contact numbers', 'Business dashboard'],
    shortDescription: 'Connect with local influencers',
    paymentType: 'recurring',
    billingCycle: 'monthly',
    popular: true
  }
];

export const useSubscriptionPackages = () => {
  const queryClient = useQueryClient();
  
  // Query to fetch all packages with shorter timeout and retry logic
  const {
    data: packages,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['subscription-packages'],
    queryFn: async () => {
      try {
        const cachedPackages = queryClient.getQueryData<ISubscriptionPackage[]>(['subscription-packages']);
        if (cachedPackages) {
          console.log("Using cached subscription packages");
          return cachedPackages;
        }
        
        console.log("Fetching all subscription packages");
        const packages = await getAllPackages();
        console.log("Successfully fetched packages:", packages?.length);
        return packages?.length > 0 ? packages : fallbackPackages;
      } catch (err) {
        console.error('Error fetching subscription packages:', err);
        // Return fallback packages instead of throwing when there's an error
        console.log("Using fallback packages due to error");
        return fallbackPackages;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    retry: 1,
    retryDelay: 1000,
    // Initialize with fallback data to avoid loading state
    placeholderData: fallbackPackages
  });
  
  // Create or update mutation with proper text handling
  const createOrUpdateMutation = useMutation({
    mutationFn: async (packageData: ISubscriptionPackage) => {
      console.log("Starting save package mutation with data:", packageData);
      
      if (!packageData.title) {
        console.error("Package title is missing");
        throw new Error("Package title is required");
      }
      
      // Ensure text fields are properly handled
      const processedData: ISubscriptionPackage = {
        ...packageData,
        fullDescription: String(packageData.fullDescription || ''),
        termsAndConditions: String(packageData.termsAndConditions || ''),
        shortDescription: String(packageData.shortDescription || '')
      };
      
      try {
        console.log("Calling savePackage service function");
        return await savePackage(processedData);
      } catch (error) {
        console.error("Error in save package mutation:", error);
        throw error;
      }
    },
    onSuccess: (savedPackage) => {
      console.log("Package saved successfully:", savedPackage);
      
      toast({
        title: "Success",
        description: `Package "${savedPackage.title}" saved successfully`,
      });
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['subscription-packages'] });
    },
    onError: (error: any) => {
      console.error("Package save error:", error);
      
      toast({
        title: "Error",
        description: `Failed to save package: ${error instanceof Error ? error.message : String(error)}`,
        variant: "destructive"
      });
    }
  });
  
  // Delete mutation with improved error handling
  const deleteMutation = useMutation({
    mutationFn: async (packageId: string) => {
      console.log("Starting delete package mutation for ID:", packageId);
      if (!packageId) {
        console.error("Package ID is missing");
        throw new Error("Package ID is required");
      }
      
      try {
        await deletePackage(packageId);
        return packageId;
      } catch (error) {
        console.error("Error in delete package mutation:", error);
        throw error;
      }
    },
    onSuccess: (packageId) => {
      console.log("Package deleted successfully:", packageId);
      
      toast({
        title: "Success",
        description: "Package deleted successfully",
      });
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['subscription-packages'] });
    },
    onError: (error: any) => {
      console.error("Package delete error:", error);
      
      toast({
        title: "Error",
        description: `Failed to delete package: ${error instanceof Error ? error.message : String(error)}`,
        variant: "destructive"
      });
    }
  });
  
  // Direct function to create or update a package with better error handling
  const createOrUpdate = async (packageData: ISubscriptionPackage) => {
    console.log("createOrUpdate function called with data:", packageData);
    try {
      // This will trigger the mutation and all its callbacks
      return await createOrUpdateMutation.mutateAsync(packageData);
    } catch (error) {
      console.error("createOrUpdate failed:", error);
      // Re-throw to allow callers to handle the error if needed
      throw error;
    }
  };
  
  // Direct function to delete a package with better error handling
  const remove = async (packageId: string) => {
    console.log("remove function called with ID:", packageId);
    try {
      await deleteMutation.mutateAsync(packageId);
      console.log("remove completed successfully");
      return true;
    } catch (error) {
      console.error("remove failed:", error);
      throw error;
    }
  };

  return {
    // Return packages with proper typing, ensuring it's always an array
    packages: packages as ISubscriptionPackage[],
    isLoading,
    isError,
    error,
    refetch,
    createOrUpdate,
    remove,
    isCreating: createOrUpdateMutation.isPending,
    isDeleting: deleteMutation.isPending
  };
};

export type { ISubscriptionPackage } from '@/models/SubscriptionPackage';
