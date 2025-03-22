
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
    queryFn: async (): Promise<ISubscriptionPackage[]> => {
      try {
        const packages = await getAllPackages();
        console.log("Fetched packages:", packages.length);
        return packages;
      } catch (err) {
        console.error('Error in useSubscriptionPackages hook:', err);
        toast({
          title: "Error",
          description: `Failed to load subscription packages: ${err instanceof Error ? err.message : String(err)}`,
          variant: "destructive"
        });
        throw err;
      }
    }
  });
  
  // Mutation to create or update a package
  const createOrUpdateMutation = useMutation({
    mutationFn: async (packageData: ISubscriptionPackage) => {
      console.log("Starting mutation with package data:", packageData);
      return await savePackage(packageData);
    },
    onSuccess: (savedPackage) => {
      console.log("Package saved successfully:", savedPackage);
      
      toast({
        title: "Success",
        description: `Package "${savedPackage.title}" saved successfully`,
      });
      
      // Invalidate the query to refetch the data
      queryClient.invalidateQueries({ queryKey: ['subscription-packages'] });
    },
    onError: (error: any) => {
      console.error("Mutation error:", error);
      toast({
        title: "Error",
        description: `Failed to save package: ${error instanceof Error ? error.message : String(error)}`,
        variant: "destructive"
      });
    }
  });
  
  // Mutation to delete a package
  const deleteMutation = useMutation({
    mutationFn: async (packageId: string) => {
      console.log("Delete mutation starting for package:", packageId);
      await deletePackage(packageId);
      return packageId;
    },
    onSuccess: (packageId) => {
      console.log("Package deleted successfully:", packageId);
      
      toast({
        title: "Success",
        description: "Package deleted successfully",
      });
      
      // Invalidate the query to refetch the data
      queryClient.invalidateQueries({ queryKey: ['subscription-packages'] });
    },
    onError: (error: any) => {
      console.error("Delete mutation error:", error);
      toast({
        title: "Error",
        description: `Failed to delete package: ${error instanceof Error ? error.message : String(error)}`,
        variant: "destructive"
      });
    }
  });
  
  // Helper method to create or update a package
  const createOrUpdate = async (packageData: ISubscriptionPackage) => {
    try {
      return await createOrUpdateMutation.mutateAsync(packageData);
    } catch (error) {
      console.error('Error in createOrUpdate helper:', error);
      // Error is already handled in the mutation's onError
      throw error;
    }
  };
  
  // Helper method to delete a package
  const remove = async (packageId: string) => {
    try {
      await deleteMutation.mutateAsync(packageId);
      return true;
    } catch (error) {
      console.error('Error in remove helper:', error);
      // Error is already handled in the mutation's onError
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
