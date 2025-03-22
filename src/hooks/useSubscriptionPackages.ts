
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ISubscriptionPackage } from '@/models/SubscriptionPackage';
import { getAllPackages, savePackage, deletePackage } from '@/services/packageService';
import { toast } from '@/hooks/use-toast';

export const useSubscriptionPackages = () => {
  const queryClient = useQueryClient();
  
  // Query to fetch all packages
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
        console.log("Fetching all subscription packages");
        const packages = await getAllPackages();
        console.log("Successfully fetched packages:", packages?.length);
        return packages;
      } catch (err) {
        console.error('Error fetching subscription packages:', err);
        toast({
          title: "Error",
          description: `Failed to load subscription packages: ${err instanceof Error ? err.message : String(err)}`,
          variant: "destructive"
        });
        throw err;
      }
    }
  });
  
  // Create or update mutation with consistent error handling
  const createOrUpdateMutation = useMutation({
    mutationFn: async (packageData: ISubscriptionPackage) => {
      console.log("Starting save package mutation with data:", packageData);
      
      if (!packageData.title) {
        console.error("Package title is missing");
        throw new Error("Package title is required");
      }
      
      try {
        console.log("Calling savePackage service function");
        const result = await savePackage(packageData);
        console.log("Save package mutation result:", result);
        
        if (!result || !result.id) {
          throw new Error("Package save failed: No valid package was returned");
        }
        
        return result;
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
      const result = await createOrUpdateMutation.mutateAsync(packageData);
      console.log("createOrUpdate completed successfully:", result);
      return result;
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
    packages: packages || [],
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
