
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
        return await getAllPackages();
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
    mutationFn: savePackage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription-packages'] });
    }
  });
  
  const deleteMutation = useMutation({
    mutationFn: deletePackage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription-packages'] });
    }
  });
  
  // Helper methods with better error handling
  const createOrUpdate = async (packageData: ISubscriptionPackage) => {
    try {
      return await createOrUpdateMutation.mutateAsync(packageData);
    } catch (error) {
      console.error('Error in createOrUpdate:', error);
      throw error;
    }
  };
  
  const remove = async (packageId: string) => {
    try {
      await deleteMutation.mutateAsync(packageId);
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
