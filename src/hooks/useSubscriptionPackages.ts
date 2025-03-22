
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ISubscriptionPackage } from '@/models/SubscriptionPackage';
import { getAllPackages, savePackage, deletePackage } from '@/services/packageService';
import { toast } from '@/hooks/use-toast';

export const useSubscriptionPackages = () => {
  const queryClient = useQueryClient();
  
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
  
  const createOrUpdateMutation = useMutation({
    mutationFn: async (packageData: ISubscriptionPackage) => {
      console.log("Mutation starting with package data:", packageData);
      return await savePackage(packageData);
    },
    onSuccess: (savedPackage) => {
      console.log("Package saved successfully in mutation:", savedPackage);
      
      // Show success toast
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
  
  const deleteMutation = useMutation({
    mutationFn: async (packageId: string) => {
      console.log("Delete mutation starting for package:", packageId);
      await deletePackage(packageId);
      return packageId;
    },
    onSuccess: (packageId) => {
      console.log("Package deleted successfully in mutation:", packageId);
      
      // Show success toast
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
  
  // Simplified helper methods that don't duplicate toast logic
  const createOrUpdate = async (packageData: ISubscriptionPackage) => {
    try {
      console.log("Creating/updating package via helper method:", packageData);
      return await createOrUpdateMutation.mutateAsync(packageData);
    } catch (error) {
      console.error('Error in createOrUpdate helper:', error);
      // Don't show toast here as it's already handled in the mutation
      throw error;
    }
  };
  
  const remove = async (packageId: string) => {
    try {
      console.log("Deleting package via helper method:", packageId);
      await deleteMutation.mutateAsync(packageId);
      return true;
    } catch (error) {
      console.error('Error in remove helper:', error);
      // Don't show toast here as it's already handled in the mutation
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
