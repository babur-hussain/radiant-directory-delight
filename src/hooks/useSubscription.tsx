import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { nanoid } from 'nanoid';
import { Subscription, SubscriptionStatus, PaymentType, BillingCycle } from '@/models/Subscription';
import { ISubscriptionPackage } from '@/models/SubscriptionPackage';

const getActiveUserSubscription = async (userId: string): Promise<Subscription | null> => {
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

const getUserSubscriptions = async (userId: string): Promise<Subscription[]> => {
  if (!userId) return [];
  
  const { data, error } = await supabase
    .from('user_subscriptions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (error || !data) return [];
  
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

const createSubscription = async (subscriptionData: Subscription): Promise<Subscription> => {
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

const updateSubscription = async (id: string, updates: Partial<Subscription>): Promise<Subscription> => {
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
  
  return { id, ...updates } as Subscription;
};

const cancelSubscription = async (id: string, reason?: string): Promise<Subscription> => {
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
  } as Subscription;
};

export const useSubscription = () => {
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);

  const {
    data: subscription,
    isLoading: loading,
    isError,
    error,
    refetch: fetchUserSubscriptionInternal
  } = useQuery({
    queryKey: ['userSubscription', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      return await getActiveUserSubscription(user.id);
    },
    enabled: !!user?.id,
  });

  const fetchUserSubscription = async () => {
    setIsProcessing(true);
    try {
      const result = await fetchUserSubscriptionInternal();
      setIsProcessing(false);
      return { success: !result.error, data: result.data };
    } catch (err) {
      setIsProcessing(false);
      console.error("Error fetching subscription:", err);
      return { success: false, data: null };
    }
  };

  const getUserSubscription = async () => {
    if (!user?.id) return null;
    try {
      return await getActiveUserSubscription(user.id);
    } catch (err) {
      console.error("Error getting subscription:", err);
      return null;
    }
  };

  const getUserDashboardFeatures = async () => {
    if (!user?.id) return [];
    try {
      const userSub = await getUserSubscription();
      return userSub?.dashboardSections || [];
    } catch (err) {
      console.error("Error getting dashboard features:", err);
      return [];
    }
  };

  const initiateSubscription = async (packageId: string, paymentDetails: any) => {
    if (!user?.id) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to purchase a subscription",
        variant: "destructive"
      });
      throw new Error("Authentication required");
    }

    setIsProcessing(true);

    try {
      const { data: packageData, error: packageError } = await supabase
        .from('subscription_packages')
        .select('*')
        .eq('id', packageId)
        .single();

      if (packageError || !packageData) {
        throw new Error("Package not found");
      }

      const subscriptionId = `sub_${nanoid(10)}`;
      
      const startDate = new Date().toISOString();
      const durationMonths = packageData.duration_months || 12;
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + durationMonths);

      const newSubscription: Subscription = {
        id: subscriptionId,
        userId: user.id,
        packageId: packageId,
        packageName: packageData.title,
        status: 'active' as SubscriptionStatus,
        startDate: startDate,
        endDate: endDate.toISOString(),
        amount: paymentDetails.amount || packageData.price,
        paymentType: (packageData.payment_type as PaymentType) || 'recurring',
        paymentMethod: paymentDetails.paymentMethod || 'razorpay',
        transactionId: paymentDetails.paymentId,
        billingCycle: (packageData.billing_cycle as BillingCycle) || 'yearly',
        signupFee: packageData.setup_fee || 0,
        recurring: packageData.payment_type === 'recurring',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        razorpaySubscriptionId: paymentDetails.subscriptionId,
        razorpayOrderId: paymentDetails.orderId,
        recurringAmount: packageData.price,
        nextBillingDate: paymentDetails.nextBillingDate,
        actualStartDate: startDate,
        dashboardFeatures: packageData.dashboard_features || [],
        dashboardSections: packageData.dashboard_sections || []
      };

      await createSubscription(newSubscription);

      const { error: userUpdateError } = await supabase
        .from('users')
        .update({
          subscription: subscriptionId,
          subscription_status: 'active',
          subscription_package: packageId
        })
        .eq('id', user.id);

      if (userUpdateError) {
        console.warn("Failed to update user with subscription info:", userUpdateError);
      }

      await fetchUserSubscriptionInternal();

      toast({
        title: "Subscription Activated",
        description: `Your ${packageData.title} subscription has been successfully activated.`,
        variant: "default"
      });

      return newSubscription;
    } catch (error) {
      console.error("Error initiating subscription:", error);
      
      toast({
        title: "Subscription Failed",
        description: error instanceof Error ? error.message : "Failed to activate subscription",
        variant: "destructive"
      });
      
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  const purchaseSubscription = async (packageData: ISubscriptionPackage) => {
    return initiateSubscription(packageData.id, {
      amount: packageData.price
    });
  };

  const renewSubscription = async (months?: number) => {
    if (!user?.id || !subscription) {
      toast({
        title: "No Active Subscription",
        description: "You don't have an active subscription to renew",
        variant: "destructive"
      });
      throw new Error("No active subscription");
    }

    setIsProcessing(true);

    try {
      const currentEndDate = new Date(subscription.endDate);
      const renewMonths = months || 12;
      currentEndDate.setMonth(currentEndDate.getMonth() + renewMonths);
      
      const updatedSubscription = await updateSubscription(subscription.id, {
        endDate: currentEndDate.toISOString(),
        updatedAt: new Date().toISOString()
      });

      toast({
        title: "Subscription Renewed",
        description: `Your subscription has been renewed for ${renewMonths} months.`,
        variant: "default"
      });

      return updatedSubscription;
    } catch (error) {
      console.error("Error renewing subscription:", error);
      
      toast({
        title: "Renewal Failed",
        description: error instanceof Error ? error.message : "Failed to renew subscription",
        variant: "destructive"
      });
      
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  const cancelSubscription = async (reason?: string) => {
    if (!user?.id || !subscription) {
      toast({
        title: "No Active Subscription",
        description: "You don't have an active subscription to cancel",
        variant: "destructive"
      });
      throw new Error("No active subscription");
    }

    setIsProcessing(true);

    try {
      await cancelSubscription(subscription.id, reason);
      
      const { error: userUpdateError } = await supabase
        .from('users')
        .update({
          subscription_status: 'cancelled'
        })
        .eq('id', user.id);

      if (userUpdateError) {
        console.warn("Failed to update user with cancelled subscription status:", userUpdateError);
      }

      toast({
        title: "Subscription Cancelled",
        description: "Your subscription has been cancelled successfully.",
        variant: "default"
      });

      return { success: true };
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      
      toast({
        title: "Cancellation Failed",
        description: error instanceof Error ? error.message : "Failed to cancel subscription",
        variant: "destructive"
      });
      
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    subscription,
    loading,
    error,
    fetchUserSubscription,
    getUserSubscription,
    getUserDashboardFeatures,
    initiateSubscription,
    purchaseSubscription,
    renewSubscription,
    cancelSubscription,
    isProcessing
  };
};

export default useSubscription;
