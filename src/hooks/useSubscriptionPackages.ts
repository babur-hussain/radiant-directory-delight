
import { useQuery } from '@tanstack/react-query';
import { ISubscriptionPackage } from '@/models/SubscriptionPackage';
import { getAllPackages, savePackage, deletePackage } from '@/services/packageService';
import { toast } from '@/hooks/use-toast';

export const useSubscriptionPackages = () => {
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
        // Use the packageService to fetch packages
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
  
  // Add methods for SubscriptionManagement component
  const createOrUpdate = async (packageData: ISubscriptionPackage) => {
    try {
      const result = await savePackage(packageData);
      await refetch();
      return result;
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to save package: ${error instanceof Error ? error.message : String(error)}`,
        variant: "destructive"
      });
      throw error;
    }
  };
  
  const remove = async (packageId: string) => {
    try {
      await deletePackage(packageId);
      await refetch();
      return true;
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to delete package: ${error instanceof Error ? error.message : String(error)}`,
        variant: "destructive"
      });
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
    remove
  };
};

export type { ISubscriptionPackage } from '@/models/SubscriptionPackage';
