
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
    mutationFn: async (packageData: ISubscriptionPackage) => {
      console.log("Mutation starting with package data:", packageData);
      
      try {
        // Ensure data has the correct types and text fields are handled properly
        let processedData = {
          ...packageData,
          // Handle features if it's a string
          features: Array.isArray(packageData.features) 
            ? packageData.features 
            : typeof packageData.features === 'string'
              ? (packageData.features as string).split('\n').filter(f => f.trim().length > 0)
              : [],
          // Ensure these fields are strings without truncation
          termsAndConditions: String(packageData.termsAndConditions || ''),
          fullDescription: String(packageData.fullDescription || ''),
          shortDescription: String(packageData.shortDescription || '')
        };
        
        console.log("Processed package data for saving:", processedData);
        
        // Call the savePackage function and await its result
        const result = await savePackage(processedData);
        console.log("Package saved successfully:", result);
        return result;
      } catch (err) {
        console.error("Error saving package in mutation:", err);
        throw err;
      }
    },
    onSuccess: (data) => {
      console.log("Mutation successful, invalidating queries", data);
      queryClient.invalidateQueries({ queryKey: ['subscription-packages'] });
      toast({
        title: "Success",
        description: "Package saved successfully",
      });
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
      queryClient.invalidateQueries({ queryKey: ['subscription-packages'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to delete package: ${error instanceof Error ? error.message : String(error)}`,
        variant: "destructive"
      });
    }
  });
  
  // Helper methods with better error handling
  const createOrUpdate = async (packageData: ISubscriptionPackage) => {
    try {
      console.log("Creating/updating package:", packageData);
      const result = await createOrUpdateMutation.mutateAsync(packageData);
      console.log("Package created/updated:", result);
      return result;
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
