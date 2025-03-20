
import { useState } from 'react';
import { useAuth } from './useAuth';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { 
  createSubscription as createSubscriptionAPI, 
  updateSubscription as updateSubscriptionAPI, 
  getUserSubscriptions, 
  getActiveUserSubscription, 
  cancelSubscription as cancelSubscriptionAPI 
} from '@/api/services/subscriptionAPI';
import { nanoid } from 'nanoid';

export const useSubscription = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);

  // Get the user's active subscription
  const {
    data: subscription,
    isLoading: isSubscriptionLoading,
    isError: isSubscriptionError,
    error: subscriptionError,
  } = useQuery({
    queryKey: ['user-subscription', user?.uid],
    queryFn: () => getActiveUserSubscription(user?.uid || ''),
    enabled: !!user?.uid,
  });

  // Get all user subscriptions
  const {
    data: subscriptions,
    isLoading: isSubscriptionsLoading,
    isError: isSubscriptionsError,
    error: subscriptionsError,
  } = useQuery({
    queryKey: ['user-subscriptions', user?.uid],
    queryFn: () => getUserSubscriptions(user?.uid || ''),
    enabled: !!user?.uid,
  });

  // Create subscription mutation
  const createSubscriptionMutation = useMutation({
    mutationFn: createSubscriptionAPI,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-subscription', user?.uid] });
      queryClient.invalidateQueries({ queryKey: ['user-subscriptions', user?.uid] });
    },
  });

  // Update subscription mutation
  const updateSubscriptionMutation = useMutation({
    mutationFn: (data: any) => updateSubscriptionAPI(data.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-subscription', user?.uid] });
      queryClient.invalidateQueries({ queryKey: ['user-subscriptions', user?.uid] });
    },
  });

  // Initiate a new subscription
  const initiateSubscription = async (packageId: string, paymentDetails?: any) => {
    setIsProcessing(true);
    try {
      if (!user?.uid) {
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
        id: nanoid(),
        user_id: user.uid,
        package_id: packageId,
        package_name: paymentDetails?.packageName || 'Subscription Package',
        status: 'active',
        start_date: today.toISOString(),
        end_date: endDate.toISOString(),
        amount: isOneTime ? (paymentDetails?.amount || 0) : (paymentDetails?.recurringAmount || 0),
        payment_type: paymentDetails?.paymentType || 'recurring',
        payment_method: 'razorpay',
        transaction_id: paymentDetails?.paymentId || '',
        billing_cycle: paymentDetails?.billingCycle || 'yearly',
        signup_fee: isOneTime ? 0 : (paymentDetails?.amount || 0),
        actual_start_date: today.toISOString(),
        ...paymentDetails
      };

      const result = await createSubscriptionMutation.mutateAsync(newSubscription);
      
      return result;
    } catch (error) {
      console.error("Failed to initiate subscription:", error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  // Cancel an active subscription
  const cancelSubscription = async (reason?: string) => {
    setIsProcessing(true);
    try {
      if (!user?.uid) {
        throw new Error("User not authenticated");
      }

      if (!subscription) {
        throw new Error("No active subscription found");
      }

      const result = await cancelSubscriptionAPI(subscription.id, reason);
      
      toast({
        title: 'Subscription Cancelled',
        description: 'Your subscription has been cancelled successfully.',
      });
      
      return result;
    } catch (error) {
      console.error("Failed to cancel subscription:", error);
      
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to cancel subscription',
        variant: 'destructive',
      });
      
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    subscription,
    subscriptions,
    isSubscriptionLoading,
    isSubscriptionsLoading,
    isSubscriptionError,
    isSubscriptionsError,
    subscriptionError,
    subscriptionsError,
    initiateSubscription,
    cancelSubscription,
    isProcessing,
    isCreating: createSubscriptionMutation.isPending,
    isUpdating: updateSubscriptionMutation.isPending,
  };
};

export default useSubscription;
