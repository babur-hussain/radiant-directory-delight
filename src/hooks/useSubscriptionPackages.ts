
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
    onSuccess: () => {
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
    mutationFn: deletePackage,
    onSuccess: () => {
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
      console.log("Creating/updating package:", packageData);
      const result = await createOrUpdateMutation.mutateAsync(packageData);
      console.log("Package saved successfully:", result);
      return result;
    } catch (error) {
      console.error('Error in createOrUpdate:', error);
      throw error;
    }
  };
  
  const remove = async (packageId: string) => {
    try {
      console.log("Deleting package:", packageId);
      await deleteMutation.mutateAsync(packageId);
      console.log("Package deleted successfully");
      return true;
    } catch (error) {
      console.error('Error in remove:', error);
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
