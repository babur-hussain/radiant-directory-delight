
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { nanoid } from 'nanoid';
import { ISubscription, SubscriptionStatus, PaymentType, BillingCycle } from '@/models/Subscription';
import { ISubscriptionPackage } from '@/models/Subscription';

// Supabase API functions
const getActiveUserSubscription = async (userId: string): Promise<ISubscription | null> => {
  if (!userId) return null;
  
  const { data, error } = await supabase
    .from('user_subscriptions')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
  
  if (error || !data) return null;
  
  // Map DB fields to interface
  return {
    id: data.id,
    userId: data.user_id,
    packageId: data.package_id,
    packageName: data.package_name,
    status: data.status as SubscriptionStatus,
    startDate: data.start_date,
    endDate: data.end_date,
    amount: data.amount,
    paymentType: (data.payment_type || 'recurring') as PaymentType,
    paymentMethod: data.payment_method,
    transactionId: data.transaction_id,
    billingCycle: (data.billing_cycle || 'yearly') as BillingCycle,
    signupFee: data.signup_fee,
    recurring: data.recurring,
    cancelledAt: data.cancelled_at,
    cancelReason: data.cancel_reason,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    razorpaySubscriptionId: data.razorpay_subscription_id,
    razorpayOrderId: data.razorpay_order_id,
    recurringAmount: data.recurring_amount,
    nextBillingDate: data.next_billing_date,
    actualStartDate: data.actual_start_date,
    dashboardFeatures: data.dashboard_features,
    dashboardSections: data.dashboard_sections
  };
};

const getUserSubscriptions = async (userId: string): Promise<ISubscription[]> => {
  if (!userId) return [];
  
  const { data, error } = await supabase
    .from('user_subscriptions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (error || !data) return [];
  
  // Map DB fields to interface
  return data.map(item => ({
    id: item.id,
    userId: item.user_id,
    packageId: item.package_id,
    packageName: item.package_name,
    status: item.status as SubscriptionStatus,
    startDate: item.start_date,
    endDate: item.end_date,
    amount: item.amount,
    paymentType: (item.payment_type || 'recurring') as PaymentType,
    paymentMethod: item.payment_method,
    transactionId: item.transaction_id,
    billingCycle: (item.billing_cycle || 'yearly') as BillingCycle,
    signupFee: item.signup_fee,
    recurring: item.recurring,
    cancelledAt: item.cancelled_at,
    cancelReason: item.cancel_reason,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
    razorpaySubscriptionId: item.razorpay_subscription_id,
    razorpayOrderId: item.razorpay_order_id,
    recurringAmount: item.recurring_amount,
    nextBillingDate: item.next_billing_date,
    actualStartDate: item.actual_start_date,
    dashboardFeatures: item.dashboard_features,
    dashboardSections: item.dashboard_sections
  }));
};

const createSubscription = async (subscriptionData: ISubscription): Promise<ISubscription> => {
  // Format for DB
  const dbData = {
    id: subscriptionData.id,
    user_id: subscriptionData.userId,
    package_id: subscriptionData.packageId,
    package_name: subscriptionData.packageName,
    status: subscriptionData.status,
    start_date: subscriptionData.startDate,
    end_date: subscriptionData.endDate,
    amount: subscriptionData.amount,
    payment_type: subscriptionData.paymentType,
    payment_method: subscriptionData.paymentMethod,
    transaction_id: subscriptionData.transactionId,
    billing_cycle: subscriptionData.billingCycle,
    signup_fee: subscriptionData.signupFee,
    recurring: subscriptionData.recurring,
    cancelled_at: subscriptionData.cancelledAt,
    cancel_reason: subscriptionData.cancelReason,
    created_at: new Date().toISOString(),
    razorpay_subscription_id: subscriptionData.razorpaySubscriptionId,
    razorpay_order_id: subscriptionData.razorpayOrderId,
    recurring_amount: subscriptionData.recurringAmount,
    next_billing_date: subscriptionData.nextBillingDate,
    actual_start_date: subscriptionData.actualStartDate,
    dashboard_features: subscriptionData.dashboardFeatures,
    dashboard_sections: subscriptionData.dashboardSections
  };
  
  const { data, error } = await supabase
    .from('user_subscriptions')
    .insert(dbData)
    .select('*')
    .single();
  
  if (error) throw error;
  
  return subscriptionData;
};

const updateSubscription = async (id: string, updates: Partial<ISubscription>): Promise<ISubscription> => {
  // Format for DB
  const dbData: any = {};
  
  if (updates.status) dbData.status = updates.status;
  if (updates.endDate) dbData.end_date = updates.endDate;
  if (updates.amount) dbData.amount = updates.amount;
  if (updates.paymentType) dbData.payment_type = updates.paymentType;
  if (updates.paymentMethod) dbData.payment_method = updates.paymentMethod;
  if (updates.transactionId) dbData.transaction_id = updates.transactionId;
  if (updates.billingCycle) dbData.billing_cycle = updates.billingCycle;
  if (updates.cancelledAt) dbData.cancelled_at = updates.cancelledAt;
  if (updates.cancelReason) dbData.cancel_reason = updates.cancelReason;
  if (updates.razorpaySubscriptionId) dbData.razorpay_subscription_id = updates.razorpaySubscriptionId;
  if (updates.razorpayOrderId) dbData.razorpay_order_id = updates.razorpayOrderId;
  if (updates.nextBillingDate) dbData.next_billing_date = updates.nextBillingDate;
  if (updates.dashboardFeatures) dbData.dashboard_features = updates.dashboardFeatures;
  if (updates.dashboardSections) dbData.dashboard_sections = updates.dashboardSections;
  
  dbData.updated_at = new Date().toISOString();
  
  const { data, error } = await supabase
    .from('user_subscriptions')
    .update(dbData)
    .eq('id', id)
    .select('*')
    .single();
  
  if (error) throw error;
  
  return { id, ...updates } as ISubscription;
};

const cancelSubscription = async (id: string, reason?: string): Promise<ISubscription> => {
  const cancelData = {
    status: 'cancelled' as SubscriptionStatus,
    cancelled_at: new Date().toISOString(),
    cancel_reason: reason || '',
    updated_at: new Date().toISOString()
  };
  
  const { data, error } = await supabase
    .from('user_subscriptions')
    .update(cancelData)
    .eq('id', id)
    .select('*')
    .single();
  
  if (error) throw error;
  
  return {
    id,
    status: 'cancelled',
    cancelledAt: new Date().toISOString(),
    cancelReason: reason || ''
  } as ISubscription;
};

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
    mutationFn: createSubscription,
    onSuccess: () => {
      fetchUserSubscription();
    },
  });

  // Update subscription mutation
  const updateSubscriptionMutation = useMutation({
    mutationFn: (data: any) => updateSubscription(data.id, data),
    onSuccess: () => {
      fetchUserSubscription();
    },
  });

  // Get user subscription - for compatibility
  const getUserSubscription = async (userId?: string) => {
    const id = userId || user?.uid || '';
    const data = await getActiveUserSubscription(id);
    return data;
  };

  // Get dashboard features for a user
  const getUserDashboardFeatures = async (userId: string) => {
    if (!subscription) {
      return [];
    }
    // Return default dashboard features or fetch from package details
    return subscription.dashboardFeatures || subscription.dashboardSections || [];
  };

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

      const newSubscription: ISubscription = {
        id: nanoid(),
        userId: user.uid,
        packageId: packageId,
        packageName: paymentDetails?.packageName || 'Subscription Package',
        status: 'active',
        startDate: today.toISOString(),
        endDate: endDate.toISOString(),
        amount: isOneTime ? (paymentDetails?.amount || 0) : (paymentDetails?.recurringAmount || 0),
        paymentType: (paymentDetails?.paymentType || 'recurring') as PaymentType,
        paymentMethod: 'razorpay',
        transactionId: paymentDetails?.paymentId || '',
        billingCycle: (paymentDetails?.billingCycle || 'yearly') as BillingCycle,
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

  // Purchase subscription (alternative to initiateSubscription)
  const purchaseSubscription = async (packageData: ISubscriptionPackage) => {
    return initiateSubscription(packageData.id, {
      packageName: packageData.title,
      amount: packageData.price,
      paymentType: packageData.paymentType || 'recurring',
      billingCycle: packageData.billingCycle || 'yearly'
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

      const result = await cancelSubscription(subscription.id, reason);
      
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
    isSubscriptionsError,
    isSubscriptionError: isError,
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
