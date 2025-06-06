
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { 
  getActiveUserSubscription, 
  getUserSubscriptions, 
  createSubscription,
  updateSubscription,
  cancelSubscription 
} from '@/services/subscriptionService';
import { Subscription } from '@/models/Subscription';

export const useSubscription = (userId?: string) => {
  const { user } = useAuth();
  const currentUserId = userId || user?.id;

  // Query for active subscription
  const { 
    data: activeSubscription, 
    isLoading: isLoadingActive, 
    error: activeError,
    refetch: refetchActive
  } = useQuery({
    queryKey: ['activeSubscription', currentUserId],
    queryFn: () => currentUserId ? getActiveUserSubscription(currentUserId) : null,
    enabled: !!currentUserId,
  });

  // Query for all user subscriptions
  const { 
    data: allSubscriptions, 
    isLoading: isLoadingAll, 
    error: allError,
    refetch: refetchAll
  } = useQuery({
    queryKey: ['userSubscriptions', currentUserId],
    queryFn: () => currentUserId ? getUserSubscriptions(currentUserId) : [],
    enabled: !!currentUserId,
  });

  // Mutation for creating subscription
  const createSubscriptionMutation = useMutation({
    mutationFn: createSubscription,
    onSuccess: (data) => {
      toast({
        title: "Subscription Created",
        description: "Your subscription has been created successfully!",
      });
      refetchActive();
      refetchAll();
    },
    onError: (error: Error) => {
      toast({
        title: "Subscription Creation Failed",
        description: error.message || "Failed to create subscription",
        variant: "destructive",
      });
    },
  });

  // Mutation for updating subscription
  const updateSubscriptionMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Subscription> }) => 
      updateSubscription(id, data),
    onSuccess: () => {
      toast({
        title: "Subscription Updated",
        description: "Your subscription has been updated successfully!",
      });
      refetchActive();
      refetchAll();
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update subscription",
        variant: "destructive",
      });
    },
  });

  // Mutation for cancelling subscription
  const cancelSubscriptionMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => 
      cancelSubscription(id, reason),
    onSuccess: () => {
      toast({
        title: "Subscription Cancelled",
        description: "Your subscription has been cancelled successfully.",
      });
      refetchActive();
      refetchAll();
    },
    onError: (error: Error) => {
      toast({
        title: "Cancellation Failed",
        description: error.message || "Failed to cancel subscription",
        variant: "destructive",
      });
    },
  });

  // Helper function to fetch user subscription (for backward compatibility)
  const fetchUserSubscription = async (userId: string) => {
    try {
      const subscription = await getActiveUserSubscription(userId);
      return {
        success: true,
        data: subscription
      };
    } catch (error) {
      console.error('Error fetching user subscription:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  };

  return {
    // Data
    activeSubscription,
    allSubscriptions,
    
    // Loading states
    isLoadingActive,
    isLoadingAll,
    isLoading: isLoadingActive || isLoadingAll,
    
    // Errors
    activeError,
    allError,
    error: activeError || allError,
    
    // Mutations
    createSubscription: createSubscriptionMutation.mutate,
    updateSubscription: updateSubscriptionMutation.mutate,
    cancelSubscription: cancelSubscriptionMutation.mutate,
    
    // Loading states for mutations
    isCreating: createSubscriptionMutation.isPending,
    isUpdating: updateSubscriptionMutation.isPending,
    isCancelling: cancelSubscriptionMutation.isPending,
    
    // Refetch functions
    refetchActive,
    refetchAll,
    refetch: () => {
      refetchActive();
      refetchAll();
    },
    
    // Backward compatibility
    fetchUserSubscription
  };
};

export default useSubscription;
