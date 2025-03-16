import { useState } from 'react';
import { ISubscription } from '@/models/Subscription';
import { createSubscription as createSubscriptionAPI, updateSubscription as updateSubscriptionAPI, getSubscription as getSubscriptionAPI, getSubscriptions as getSubscriptionsAPI, deleteSubscription as deleteSubscriptionAPI, getUserSubscriptions as getUserSubscriptionsAPI, getActiveUserSubscription } from '@/services/subscriptionService';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { nanoid } from 'nanoid';
import { useAuth } from './useAuth';

export const useSubscription = () => {
  const queryClient = useQueryClient();
  const [subscription, setSubscription] = useState<ISubscription | null>(null);
  const { currentUser } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);

  const {
    data: fetchedSubscription,
    isLoading: isSubscriptionLoading,
    isError: isSubscriptionError,
    error: subscriptionError,
  } = useQuery({
    queryKey: ['subscription', subscription?.id],
    queryFn: () => getSubscriptionAPI(subscription?.id || ''),
    enabled: !!subscription?.id,
  });

  const {
    data: subscriptions,
    isLoading: isSubscriptionsLoading,
    isError: isSubscriptionsError,
    error: subscriptionsError,
  } = useQuery({
    queryKey: ['subscriptions'],
    queryFn: getSubscriptionsAPI,
  });

  const getUserSubscription = async () => {
    if (!currentUser?.uid) return null;
    return await getActiveUserSubscription(currentUser.uid);
  };

  const createSubscriptionMutation = useMutation({
    mutationFn: (subscriptionData: ISubscription) => createSubscriptionAPI(subscriptionData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
    },
  });

  const updateSubscriptionMutation = useMutation({
    mutationFn: (subscriptionData: ISubscription) => updateSubscriptionAPI(subscriptionData.id, subscriptionData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['subscription', subscription?.id] });
    },
  });

  const deleteSubscriptionMutation = useMutation({
    mutationFn: (id: string) => deleteSubscriptionAPI(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
    },
  });

  const createSubscription = async (subscriptionData: Omit<ISubscription, 'id'>) => {
    const newSubscription = {
      id: nanoid(),
      ...subscriptionData,
      status: subscriptionData.status || 'active',
      startDate: subscriptionData.startDate || new Date().toISOString(),
      endDate: subscriptionData.endDate || new Date().toISOString(),
      packageId: subscriptionData.packageId || '',
      packageName: subscriptionData.packageName || '',
      userId: subscriptionData.userId || '',
      amount: subscriptionData.amount || 0,
      paymentType: subscriptionData.paymentType || 'recurring'
    } as ISubscription;

    const result = await createSubscriptionMutation.mutateAsync(newSubscription);
    return result;
  };

  const updateSubscription = async (subscriptionData: ISubscription) => {
    return await updateSubscriptionMutation.mutateAsync(subscriptionData);
  };

  const deleteSubscription = async (id: string) => {
    return await deleteSubscriptionMutation.mutateAsync(id);
  };

  const initiateSubscription = async (packageId: string, paymentDetails?: any) => {
    setIsProcessing(true);
    try {
      if (!currentUser?.uid) {
        throw new Error("User not authenticated");
      }

      const today = new Date();
      const endDate = new Date();
      endDate.setFullYear(today.getFullYear() + 1);

      const newSubscription = {
        userId: currentUser.uid,
        packageId: packageId,
        packageName: paymentDetails?.packageName || 'Subscription Package',
        status: 'active',
        startDate: today.toISOString(),
        endDate: endDate.toISOString(),
        amount: paymentDetails?.amount || 0,
        paymentType: paymentDetails?.paymentType || 'recurring',
        paymentMethod: 'razorpay',
        transactionId: paymentDetails?.paymentId || '',
        ...paymentDetails
      };

      const result = await createSubscription(newSubscription);
      
      queryClient.invalidateQueries({ queryKey: ['user-subscription', currentUser.uid] });
      
      return result;
    } catch (error) {
      console.error("Failed to initiate subscription:", error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  const cancelSubscription = async () => {
    setIsProcessing(true);
    try {
      if (!currentUser?.uid) {
        throw new Error("User not authenticated");
      }

      const currentSubscription = await getUserSubscription();
      
      if (!currentSubscription) {
        throw new Error("No active subscription found");
      }

      const updatedSubscription = {
        ...currentSubscription,
        status: 'cancelled',
        cancelledAt: new Date().toISOString(),
      };

      const result = await updateSubscription(updatedSubscription);
      
      queryClient.invalidateQueries({ queryKey: ['user-subscription', currentUser.uid] });
      
      return result;
    } catch (error) {
      console.error("Failed to cancel subscription:", error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
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
    getUserSubscription,
    isCreating: createSubscriptionMutation.isPending,
    isUpdating: updateSubscriptionMutation.isPending,
    isDeleting: deleteSubscriptionMutation.isPending,
    initiateSubscription,
    cancelSubscription,
    isProcessing,
  };
};

export default useSubscription;
