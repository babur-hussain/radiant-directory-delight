
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { nanoid } from 'nanoid';
import { ISubscriptionPackage } from '@/models/SubscriptionPackage';

export const useSubscription = (userId?: string) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Get the user ID either from the prop or from the auth context
  const currentUserId = userId || user?.id;
  
  const purchaseSubscription = async (packageData: ISubscriptionPackage) => {
    if (!currentUserId) {
      toast({
        title: "Authentication Required",
        description: "Please login to purchase a subscription",
        variant: "destructive",
      });
      return null;
    }
    
    setIsProcessing(true);
    
    try {
      // Create a subscription record in the database
      const subscription = {
        id: nanoid(),
        user_id: currentUserId,
        package_id: packageData.id,
        package_name: packageData.title,
        amount: packageData.price + (packageData.setupFee || 0),
        start_date: new Date().toISOString(),
        end_date: getEndDate(packageData),
        status: 'active',
        payment_method: 'razorpay',
        payment_type: packageData.paymentType,
        billing_cycle: packageData.billingCycle,
        signup_fee: packageData.setupFee,
        recurring_amount: packageData.price,
        is_paused: false,
        is_pausable: true,
        is_user_cancellable: true,
        assigned_by: 'system',
      };

      // Call the subscription service to create the subscription
      const { data, error } = await supabase
        .from('user_subscriptions')
        .insert([subscription])
        .select();
      
      if (error) {
        console.error('Error creating subscription:', error);
        throw new Error('Failed to create subscription');
      }

      // Update user record with subscription info
      await supabase
        .from('users')
        .update({
          subscription_id: subscription.id,
          subscription_status: 'active',
          subscription_package: subscription.package_id
        })
        .eq('id', currentUserId);
      
      toast({
        title: "Subscription Activated",
        description: "Your subscription has been activated successfully",
      });
      
      return data?.[0] || null;
    } catch (error) {
      console.error('Error in purchaseSubscription:', error);
      toast({
        title: "Subscription Failed",
        description: "There was an error activating your subscription",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsProcessing(false);
    }
  };
  
  const fetchUserSubscription = async (userId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching user subscription:', error);
        setError(error.message);
        return { success: false, error: error.message };
      }
      
      if (data) {
        setSubscription(data);
      }
      
      return { success: true, data };
    } catch (error) {
      console.error('Error in fetchUserSubscription:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch subscription');
      return { success: false, error: 'Failed to fetch subscription' };
    } finally {
      setLoading(false);
    }
  };
  
  const getUserDashboardFeatures = async (userId: string, role: string) => {
    try {
      // First get the user's active subscription
      const { data: subscription } = await fetchUserSubscription(userId);
      
      if (!subscription) {
        return { success: false, services: [] };
      }
      
      // Get the subscription package
      const { data: packageData, error: packageError } = await supabase
        .from('subscription_packages')
        .select('dashboard_sections')
        .eq('id', subscription.package_id)
        .single();
      
      if (packageError) {
        console.error('Error fetching package data:', packageError);
        return { success: false, services: [] };
      }
      
      return { 
        success: true, 
        services: packageData.dashboard_sections || [] 
      };
    } catch (error) {
      console.error('Error in getUserDashboardFeatures:', error);
      return { success: false, services: [] };
    }
  };
  
  const cancelSubscription = async () => {
    if (!currentUserId) {
      toast({
        title: "Authentication Required",
        description: "Please login to cancel a subscription",
        variant: "destructive",
      });
      return false;
    }
    
    try {
      setIsProcessing(true);
      
      // Get the current active subscription
      const { data: subscription } = await fetchUserSubscription(currentUserId);
      
      if (!subscription) {
        toast({
          title: "No Active Subscription",
          description: "You don't have an active subscription to cancel",
          variant: "destructive",
        });
        return false;
      }
      
      // Update the subscription status to cancelled
      const { error } = await supabase
        .from('user_subscriptions')
        .update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString()
        })
        .eq('id', subscription.id);
      
      if (error) throw error;
      
      // Update the user's subscription status
      await supabase
        .from('users')
        .update({
          subscription_status: 'cancelled'
        })
        .eq('id', currentUserId);
      
      toast({
        title: "Subscription Cancelled",
        description: "Your subscription has been cancelled successfully",
      });
      
      return true;
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      toast({
        title: "Cancellation Failed",
        description: "There was an error cancelling your subscription",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Helper function to calculate end date based on package details
  const getEndDate = (packageData: ISubscriptionPackage): string => {
    const startDate = new Date();
    const monthsToAdd = packageData.durationMonths || 12;
    
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + monthsToAdd);
    
    return endDate.toISOString();
  };
  
  return {
    isProcessing,
    purchaseSubscription,
    fetchUserSubscription,
    getUserDashboardFeatures,
    cancelSubscription,
    subscription,
    loading,
    error
  };
};

export default useSubscription;
