
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { 
  getSubscriptionPackages, 
  getPackagesByType, 
  createOrUpdatePackage, 
  deletePackage,
} from '@/lib/mongodb/subscriptionUtils';
import { isServerRunning } from '@/lib/mongodb-utils';
import { ISubscriptionPackage } from '@/models/SubscriptionPackage';

// Hook for managing subscription packages
export const useSubscriptionPackages = (type?: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [serverStatus, setServerStatus] = useState<boolean | null>(null);

  // Check server status
  useEffect(() => {
    const checkServer = async () => {
      const status = await isServerRunning();
      setServerStatus(status);
    };
    
    checkServer();
  }, []);

  // Query for fetching all packages or by type
  const {
    data: packages,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['subscription-packages', type],
    queryFn: async () => {
      if (type) {
        return await getPackagesByType(type);
      }
      return await getSubscriptionPackages();
    },
    enabled: serverStatus !== false, // Only run if server is available
  });

  // Mutation for creating/updating a package
  const createPackageMutation = useMutation({
    mutationFn: (packageData: ISubscriptionPackage) => {
      return createOrUpdatePackage(packageData);
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Subscription package saved successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['subscription-packages'] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to save package: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive',
      });
    },
  });

  // Mutation for deleting a package
  const deletePackageMutation = useMutation({
    mutationFn: (packageId: string) => {
      return deletePackage(packageId);
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Subscription package deleted successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['subscription-packages'] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to delete package: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive',
      });
    },
  });

  return {
    packages,
    isLoading,
    isError,
    error,
    refetch,
    createPackage: createPackageMutation.mutate,
    deletePackage: deletePackageMutation.mutate,
    isCreating: createPackageMutation.isPending,
    isDeleting: deletePackageMutation.isPending,
    serverStatus,
  };
};

export default useSubscriptionPackages;
