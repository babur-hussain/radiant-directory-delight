
import { useState } from 'react';
import { useAuth } from './useAuth';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { 
  createSubscription as createSubscriptionAPI, 
  updateSubscription as updateSubscriptionAPI, 
  getUserSubscriptions, 
  getActiveUserSubscription, 
  cancelSubscription as cancelSubscriptionAPI 
} from '@/api/services/subscriptionAPI';
import { nanoid } from 'nanoid';
import { ISubscription } from '@/models/Subscription';
import { ISubscriptionPackage } from '@/hooks/useSubscriptionPackages';

export const useSubscription = () => {
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);

  // Get the user's active subscription
  const {
    data: subscription,
    isLoading,
    isError,
    error,
    refetch: fetchUserSubscription
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
      fetchUserSubscription();
    },
  });

  // Update subscription mutation
  const updateSubscriptionMutation = useMutation({
    mutationFn: (data: any) => updateSubscriptionAPI(data.id, data),
    onSuccess: () => {
      fetchUserSubscription();
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
        userId: user.uid,
        packageId: packageId,
        packageName: paymentDetails?.packageName || 'Subscription Package',
        status: 'active' as const,
        startDate: today.toISOString(),
        endDate: endDate.toISOString(),
        amount: isOneTime ? (paymentDetails?.amount || 0) : (paymentDetails?.recurringAmount || 0),
        paymentType: (paymentDetails?.paymentType || 'recurring') as 'recurring' | 'one-time',
        paymentMethod: 'razorpay',
        transactionId: paymentDetails?.paymentId || '',
        billingCycle: (paymentDetails?.billingCycle || 'yearly') as 'monthly' | 'yearly',
        signupFee: isOneTime ? 0 : (paymentDetails?.amount || 0),
        actualStartDate: today.toISOString(),
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

  // For compatibility with existing components
  const getUserSubscription = async () => {
    const data = await fetchUserSubscription();
    return data.data;
  };

  // Get dashboard features for a user
  const getUserDashboardFeatures = async (userId: string) => {
    if (!subscription) {
      return [];
    }
    // Return default dashboard features or fetch from package details
    return subscription.dashboardFeatures || subscription.dashboardSections || [];
  };

  // Purchase subscription (alternative to initiateSubscription)
  const purchaseSubscription = async (packageData: ISubscriptionPackage) => {
    return initiateSubscription(packageData.id, {
      packageName: packageData.title,
      amount: packageData.price,
      paymentType: packageData.paymentType,
      billingCycle: packageData.billingCycle
    });
  };

  // Renew an existing subscription
  const renewSubscription = async (months: number = 12) => {
    if (!subscription) {
      throw new Error("No active subscription to renew");
    }
    
    const endDate = new Date(subscription.endDate);
    endDate.setMonth(endDate.getMonth() + months);
    
    const updated = await updateSubscriptionMutation.mutateAsync({
      id: subscription.id,
      endDate: endDate.toISOString()
    });
    
    return updated;
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

      const cancellationData = {
        id: subscription.id,
        status: 'cancelled' as const,
        cancelledAt: new Date().toISOString(),
        cancelReason: reason || '',
        // Add required fields to satisfy TypeScript
        userId: subscription.userId,
        packageId: subscription.packageId,
        packageName: subscription.packageName,
        startDate: subscription.startDate,
        endDate: subscription.endDate,
        amount: subscription.amount,
        paymentType: subscription.paymentType
      };

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
    loading: isLoading,
    error: error as Error,
    fetchUserSubscription,
    getUserSubscription,
    getUserDashboardFeatures,
    isSubscriptionLoading: isLoading,
    isSubscriptionsLoading,
    isSubscriptionError: isError,
    isSubscriptionsError,
    subscriptionError: error,
    subscriptionsError,
    initiateSubscription,
    purchaseSubscription,
    renewSubscription,
    cancelSubscription,
    isProcessing,
    isCreating: createSubscriptionMutation.isPending,
    isUpdating: updateSubscriptionMutation.isPending,
  };
};

export default useSubscription;
