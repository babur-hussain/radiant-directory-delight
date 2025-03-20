
import { useState } from 'react';
import { ISubscription } from '@/models/Subscription';
import { createSubscription as createSubscriptionAPI, updateSubscription as updateSubscriptionAPI, getSubscription as getSubscriptionAPI, getSubscriptions as getSubscriptionsAPI, deleteSubscription as deleteSubscriptionAPI, getUserSubscriptions as getUserSubscriptionsAPI, getActiveUserSubscription } from '@/services/subscriptionService';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { nanoid } from 'nanoid';
import { useAuth } from './useAuth';
import { getUserDashboardSections } from "@/utils/dashboardSections";

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
      
      // Set end date based on billing cycle
      if (paymentDetails?.billingCycle === 'monthly') {
        endDate.setMonth(today.getMonth() + 1); // 1 month for monthly billing
      } else {
        endDate.setFullYear(today.getFullYear() + 1); // 1 year for yearly billing or default
      }

      // Determine if this is a one-time payment or recurring subscription
      const isOneTime = paymentDetails?.paymentType === 'one-time';

      const newSubscription = {
        userId: currentUser.uid,
        packageId: packageId,
        packageName: paymentDetails?.packageName || 'Subscription Package',
        status: 'active',
        startDate: today.toISOString(),
        endDate: endDate.toISOString(),
        amount: isOneTime ? (paymentDetails?.amount || 0) : (paymentDetails?.recurringAmount || 0),
        paymentType: paymentDetails?.paymentType || 'recurring',
        paymentMethod: 'razorpay',
        transactionId: paymentDetails?.paymentId || '',
        billingCycle: paymentDetails?.billingCycle || 'yearly',
        signupFee: isOneTime ? 0 : (paymentDetails?.amount || 0),
        recurringAmount: isOneTime ? 0 : (paymentDetails?.recurringAmount || 0),
        razorpaySubscriptionId: paymentDetails?.subscriptionId || '',
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

  const getUserDashboardFeatures = async (userId?: string) => {
    if (!userId) {
      console.log("Cannot get dashboard features: No user ID provided");
      return [];
    }
    
    try {
      // Use the user's role if available, otherwise default to Business
      const userRole = "Business"; // Default role
      return await getUserDashboardSections(userId, userRole);
    } catch (error) {
      console.error("Error getting user dashboard features:", error);
      return [];
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
    getUserDashboardFeatures
  };
};

export default useSubscription;
