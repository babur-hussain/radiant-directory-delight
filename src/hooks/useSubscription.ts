
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { ISubscriptionPackage } from '@/models/SubscriptionPackage';

export interface IUserSubscription {
  id: string;
  user_id: string;
  package_id: string;
  package_name: string;
  amount: number;
  start_date: string;
  end_date: string;
  status: string;
  created_at: string;
  updated_at: string;
  cancelled_at: string;
  cancel_reason: string;
  assigned_by: string;
  assigned_at: string;
  advance_payment_months: number;
  is_paused: boolean;
  is_pausable: boolean;
  is_user_cancellable: boolean;
  payment_type: string;
  invoice_ids: string[];
  actual_start_date: string;
  signup_fee: number;
  billing_cycle: string;
  transaction_id: string;
}

// Define the return type for fetchUserSubscription
interface SubscriptionResult {
  success: boolean;
  data: IUserSubscription | null;
}

/**
 * Hook for managing subscription-related operations
 */
export const useSubscription = (userId?: string) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userSubscription, setUserSubscription] = useState<IUserSubscription | null>(null);

  /**
   * Purchase a subscription for the user
   */
  const purchaseSubscription = async (packageData: ISubscriptionPackage) => {
    setIsProcessing(true);
    try {
      // Generate unique ID for the subscription
      const subscriptionId = `sub_${Date.now()}`;
      
      // Calculate end date based on duration
      const startDate = new Date();
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + (packageData.durationMonths || 12));
      
      // Prepare subscription data
      const subscriptionData = {
        id: subscriptionId,
        user_id: userId,
        package_id: packageData.id,
        package_name: packageData.title,
        amount: packageData.price,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        status: "active",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        actual_start_date: startDate.toISOString(),
        advance_payment_months: packageData.advancePaymentMonths || 0,
        signup_fee: packageData.setupFee || 0,
        payment_type: packageData.paymentType || "recurring",
        is_pausable: true,
        is_user_cancellable: true
      };
      
      // Save to Supabase
      const { data, error } = await supabase
        .from('user_subscriptions')
        .insert([subscriptionData])
        .select()
        .single();
      
      if (error) throw error;
      
      // Update user record with subscription info
      await supabase
        .from('users')
        .update({
          subscription_id: subscriptionId,
          subscription_status: "active",
          subscription_package: packageData.id
        })
        .eq('id', userId);
      
      toast({
        title: "Subscription Activated",
        description: `You have successfully subscribed to ${packageData.title}`,
      });
      
      return data;
    } catch (err) {
      console.error('Error purchasing subscription:', err);
      
      toast({
        title: "Subscription Failed",
        description: err instanceof Error ? err.message : "An error occurred while processing your subscription",
        variant: "destructive"
      });
      
      throw err;
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Fetch a user's subscription
   */
  const fetchUserSubscription = async (uid: string): Promise<SubscriptionResult> => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: subError } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', uid)
        .order('created_at', { ascending: false })
        .maybeSingle();
      
      if (subError) {
        console.error('Error fetching user subscription:', subError);
        setError(subError.message);
        setLoading(false);
        return { success: false, data: null };
      }
      
      setUserSubscription(data);
      setLoading(false);
      return { success: true, data };
    } catch (err) {
      console.error('Error in fetchUserSubscription:', err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      setLoading(false);
      return { success: false, data: null };
    }
  };

  /**
   * Cancel a user's subscription
   */
  const cancelSubscription = async (subscriptionId: string, reason: string = 'user_cancelled') => {
    setIsProcessing(true);
    try {
      const now = new Date().toISOString();
      
      const { data, error } = await supabase
        .from('user_subscriptions')
        .update({
          status: 'cancelled',
          cancelled_at: now,
          cancel_reason: reason,
          updated_at: now
        })
        .eq('id', subscriptionId)
        .select();
      
      if (error) throw new Error(error.message);
      
      // Update user record
      if (userId) {
        await supabase
          .from('users')
          .update({
            subscription_status: 'cancelled',
            updated_at: now
          })
          .eq('id', userId);
      }
      
      toast({
        title: "Subscription Cancelled",
        description: "Your subscription has been cancelled successfully.",
      });
      
      return data?.[0] || null;
    } catch (err) {
      console.error('Error cancelling subscription:', err);
      
      toast({
        title: "Cancellation Failed",
        description: err instanceof Error ? err.message : "An error occurred while cancelling your subscription",
        variant: "destructive"
      });
      
      throw err;
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Get user's dashboard features based on their subscription
   */
  const getUserDashboardFeatures = async (uid: string, role: string) => {
    try {
      // First get user's active subscription
      const { data: subscription } = await supabase
        .from('user_subscriptions')
        .select('package_id')
        .eq('user_id', uid)
        .eq('status', 'active')
        .maybeSingle();
      
      if (!subscription) return [];
      
      // Get package details
      const { data: packageData } = await supabase
        .from('subscription_packages')
        .select('dashboard_sections')
        .eq('id', subscription.package_id)
        .single();
      
      return packageData?.dashboard_sections || [];
    } catch (err) {
      console.error('Error getting user dashboard features:', err);
      return [];
    }
  };

  return {
    isProcessing,
    loading,
    error,
    userSubscription,
    purchaseSubscription,
    fetchUserSubscription,
    cancelSubscription,
    getUserDashboardFeatures
  };
};

export default useSubscription;
