
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createSubscription, updateSubscription, deleteSubscription } from '@/services/subscriptionService';
import { ISubscription } from '@/models/Subscription';
import { nanoid } from 'nanoid';

const useAdminSubscriptionAssignment = () => {
  const [isEditing, setIsEditing] = useState(false);
  const queryClient = useQueryClient();

  const createSubscriptionMutation = useMutation({
    mutationFn: async (subscriptionData: Omit<ISubscription, 'id'>) => {
      // Ensure all required fields are present
      if (!subscriptionData.userId || !subscriptionData.packageId) {
        throw new Error("User ID and Package ID are required.");
      }

      const subscription = await createSubscription({
        id: nanoid(), // Generate an ID if it doesn't exist
        ...subscriptionData,
        // Ensure all required fields are present
        status: subscriptionData.status || 'active',
        startDate: subscriptionData.startDate || new Date().toISOString(),
        endDate: subscriptionData.endDate || new Date().toISOString(),
        packageId: subscriptionData.packageId || '',
        packageName: subscriptionData.packageName || '',
        userId: subscriptionData.userId || '',
        amount: subscriptionData.amount || 0,
        paymentType: subscriptionData.paymentType || 'recurring'
      });
      return subscription;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['userSubscriptions'] });
    },
    onError: (error) => {
      console.error("Error creating subscription:", error);
    },
  });

  const updateSubscriptionMutation = useMutation({
    mutationFn: async (subscriptionData: ISubscription) => {
      if (!subscriptionData.id) {
        throw new Error("Subscription ID is required for updating.");
      }
      const subscription = await updateSubscription(subscriptionData.id, subscriptionData);
      return subscription;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['userSubscriptions'] });
    },
    onError: (error) => {
      console.error("Error updating subscription:", error);
    },
  });

  const deleteSubscriptionMutation = useMutation({
    mutationFn: async (id: string) => {
      await deleteSubscription(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['userSubscriptions'] });
    },
    onError: (error) => {
      console.error("Error deleting subscription:", error);
    },
  });

  return {
    isEditing,
    setIsEditing,
    createSubscription: createSubscriptionMutation.mutateAsync,
    updateSubscription: updateSubscriptionMutation.mutateAsync,
    deleteSubscription: deleteSubscriptionMutation.mutateAsync,
    isLoading: createSubscriptionMutation.isPending || updateSubscriptionMutation.isPending || deleteSubscriptionMutation.isPending,
    error: createSubscriptionMutation.error || updateSubscriptionMutation.error || deleteSubscriptionMutation.error,
  };
};

export default useAdminSubscriptionAssignment;
