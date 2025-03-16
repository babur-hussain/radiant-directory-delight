import { useState } from 'react';
import { ISubscription } from '@/models/Subscription';
import { createSubscription as createSubscriptionAPI, updateSubscription as updateSubscriptionAPI, getSubscription as getSubscriptionAPI, getSubscriptions as getSubscriptionsAPI, deleteSubscription as deleteSubscriptionAPI } from '@/services/subscriptionService';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { nanoid } from 'nanoid';

const useSubscription = () => {
  const queryClient = useQueryClient();
  const [subscription, setSubscription] = useState<ISubscription | null>(null);

  // Function to fetch a single subscription by ID
  const {
    data: fetchedSubscription,
    isLoading: isSubscriptionLoading,
    isError: isSubscriptionError,
    error: subscriptionError,
  } = useQuery<ISubscription, Error>(
    ['subscription', subscription?.id],
    () => getSubscriptionAPI(subscription?.id || ''),
    {
      enabled: !!subscription?.id, // Only run the query if subscriptionId is not null
    }
  );

  // Function to fetch all subscriptions
  const {
    data: subscriptions,
    isLoading: isSubscriptionsLoading,
    isError: isSubscriptionsError,
    error: subscriptionsError,
  } = useQuery<ISubscription[], Error>(['subscriptions'], getSubscriptionsAPI);

  // Mutation to create a new subscription
  const createSubscriptionMutation = useMutation<ISubscription, Error, ISubscription>(
    createSubscriptionAPI,
    {
      onSuccess: () => {
        // Invalidate and refetch queries after successful creation
        queryClient.invalidateQueries(['subscriptions']);
      },
    }
  );

  // Mutation to update an existing subscription
  const updateSubscriptionMutation = useMutation<ISubscription, Error, ISubscription>(
    updateSubscriptionAPI,
    {
      onSuccess: () => {
        // Invalidate and refetch queries after successful update
        queryClient.invalidateQueries(['subscriptions']);
        queryClient.invalidateQueries(['subscription', subscription?.id]);
      },
    }
  );

  // Mutation to delete a subscription
  const deleteSubscriptionMutation = useMutation<void, Error, string>(
    deleteSubscriptionAPI,
    {
      onSuccess: () => {
        // Invalidate and refetch queries after successful deletion
        queryClient.invalidateQueries(['subscriptions']);
      },
    }
  );

  // Helper functions to trigger mutations
  const createSubscription = async (subscriptionData: ISubscription) => {
    // Update the problematic line where we're passing SubscriptionData to something expecting ISubscription
    // Change this:
    // const subscription = await createSubscription(subscriptionData);
    // To this:
    const subscription = await createSubscriptionMutation.mutateAsync({
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
  };

  const updateSubscription = async (subscriptionData: ISubscription) => {
    return await updateSubscriptionMutation.mutateAsync(subscriptionData);
  };

  const deleteSubscription = async (id: string) => {
    return await deleteSubscriptionMutation.mutateAsync(id);
  };

  return {
    subscription: fetchedSubscription,
    subscriptions,
    isSubscriptionLoading,
    isSubscriptionsLoading,
    isSubscriptionError,
    subscriptionsError,
    subscriptionError,
    createSubscription,
    updateSubscription,
    deleteSubscription,
    isCreating: createSubscriptionMutation.isLoading,
    isUpdating: updateSubscriptionMutation.isLoading,
    isDeleting: deleteSubscriptionMutation.isLoading,
  };
};

export default useSubscription;
