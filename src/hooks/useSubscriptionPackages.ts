
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
        console.log("Successfully fetched packages:", packages.length);
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
  
  // Create or update mutation
  const createOrUpdateMutation = useMutation({
    mutationFn: async (packageData: ISubscriptionPackage) => {
      console.log("Starting save package mutation with data:", packageData);
      if (!packageData.title) {
        console.error("Package title is missing");
        throw new Error("Package title is required");
      }
      
      return await savePackage(packageData);
    },
    onSuccess: (savedPackage, variables) => {
      console.log("Package saved successfully:", savedPackage);
      
      toast({
        title: "Success",
        description: `Package "${savedPackage.title}" saved successfully`,
      });
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['subscription-packages'] });
    },
    onError: (error: any, variables) => {
      console.error("Package save error:", error);
      console.error("Failed package data:", variables);
      
      toast({
        title: "Error",
        description: `Failed to save package: ${error instanceof Error ? error.message : String(error)}`,
        variant: "destructive"
      });
    }
  });
  
  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (packageId: string) => {
      console.log("Starting delete package mutation for ID:", packageId);
      if (!packageId) {
        console.error("Package ID is missing");
        throw new Error("Package ID is required");
      }
      
      return await deletePackage(packageId);
    },
    onSuccess: (_, packageId) => {
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
  
  // Direct function to create or update a package
  const createOrUpdate = async (packageData: ISubscriptionPackage) => {
    try {
      console.log("createOrUpdate function called with data:", packageData);
      return await createOrUpdateMutation.mutateAsync(packageData);
    } catch (error) {
      console.error('Error in createOrUpdate function:', error);
      throw error;
    }
  };
  
  // Direct function to delete a package
  const remove = async (packageId: string) => {
    try {
      console.log("remove function called with ID:", packageId);
      await deleteMutation.mutateAsync(packageId);
      return true;
    } catch (error) {
      console.error('Error in remove function:', error);
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
