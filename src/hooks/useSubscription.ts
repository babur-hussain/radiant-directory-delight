
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ISubscriptionPackage } from '@/hooks/useSubscriptionPackages';
import { toast } from './use-toast';

export const useSubscription = (userId?: string) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchUserSubscription = async (userId: string) => {
    try {
      if (!userId) {
        console.log('No user ID provided to fetchUserSubscription');
        return { success: false, data: null };
      }

      console.log(`Fetching subscription for user ${userId}`);
      
      // First check active subscriptions in the user_subscriptions table
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching user subscription:', error);
        return { success: false, data: null, error: error.message };
      }
      
      if (data) {
        console.log('Found subscription:', data);
        return { success: true, data };
      }
      
      // If no subscription found in dedicated table, check the users table for legacy data
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('subscription, subscription_id, subscription_status, subscription_package')
        .eq('id', userId)
        .single();
      
      if (userError) {
        console.error('Error fetching user for subscription info:', userError);
        return { success: false, data: null, error: userError.message };
      }
      
      if (userData && userData.subscription_id) {
        const legacySubscription = {
          id: userData.subscription_id,
          user_id: userId,
          package_id: userData.subscription_package,
          status: userData.subscription_status,
          // Add other required fields with default values
          start_date: new Date().toISOString(),
          end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          amount: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        console.log('Found legacy subscription in user data:', legacySubscription);
        return { success: true, data: legacySubscription };
      }
      
      console.log('No subscription found for user');
      return { success: false, data: null };
    } catch (err) {
      console.error('Error in fetchUserSubscription:', err);
      return { 
        success: false, 
        data: null, 
        error: err instanceof Error ? err.message : 'An unknown error occurred' 
      };
    }
  };

  const purchaseSubscription = async (packageData: ISubscriptionPackage) => {
    setIsProcessing(true);
    try {
      if (!userId) {
        throw new Error('User ID is required to purchase a subscription');
      }

      console.log(`Purchasing subscription for user ${userId}`);
      
      // Generate a subscription ID
      const subscriptionId = `sub_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
      
      // Calculate start and end dates
      const startDate = new Date();
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + (packageData.durationMonths || 12));
      
      // Create subscription data
      const subscriptionData = {
        id: subscriptionId,
        user_id: userId,
        package_id: packageData.id,
        package_name: packageData.title,
        amount: packageData.price,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        status: 'active',
        payment_type: packageData.paymentType || 'recurring',
        billing_cycle: packageData.billingCycle,
        setup_fee: packageData.setupFee || 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        advance_payment_months: packageData.advancePaymentMonths || 0,
        actual_start_date: startDate.toISOString(),
      };
      
      // Save to Supabase
      const { data, error } = await supabase
        .from('user_subscriptions')
        .insert([subscriptionData])
        .select()
        .single();
      
      if (error) {
        throw new Error(`Failed to create subscription: ${error.message}`);
      }
      
      // Update user record
      const { error: userError } = await supabase
        .from('users')
        .update({
          subscription: subscriptionId,
          subscription_id: subscriptionId,
          subscription_status: 'active',
          subscription_package: packageData.id
        })
        .eq('id', userId);
      
      if (userError) {
        console.warn(`Warning: Failed to update user record: ${userError.message}`);
      }
      
      console.log('Subscription created successfully:', data);
      
      return data;
    } catch (err) {
      console.error('Error in purchaseSubscription:', err);
      throw err;
    } finally {
      setIsProcessing(false);
    }
  };

  const getUserDashboardFeatures = async (userId: string, role: string) => {
    try {
      // First get the user's subscription
      const { success, data: subscription } = await fetchUserSubscription(userId);
      
      if (!success || !subscription || !subscription.package_id) {
        return { success: false, features: [] };
      }
      
      // Get the subscription package
      const { data: packageData, error: packageError } = await supabase
        .from('subscription_packages')
        .select('dashboard_sections')
        .eq('id', subscription.package_id)
        .single();
      
      if (packageError) {
        console.error('Error fetching package details:', packageError);
        return { success: false, features: [] };
      }
      
      if (packageData && packageData.dashboard_sections) {
        return { success: true, features: packageData.dashboard_sections };
      }
      
      return { success: false, features: [] };
    } catch (err) {
      console.error('Error in getUserDashboardFeatures:', err);
      return { success: false, features: [] };
    }
  };

  const cancelSubscription = async (subscriptionId: string, reason: string = 'user_cancelled') => {
    try {
      if (!subscriptionId) {
        throw new Error('Subscription ID is required to cancel a subscription');
      }
      
      console.log(`Cancelling subscription ${subscriptionId}`);
      
      // Update subscription status
      const { data, error } = await supabase
        .from('user_subscriptions')
        .update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
          cancel_reason: reason,
          updated_at: new Date().toISOString()
        })
        .eq('id', subscriptionId)
        .select()
        .single();
      
      if (error) {
        throw new Error(`Failed to cancel subscription: ${error.message}`);
      }
      
      // Update user record
      if (userId) {
        const { error: userError } = await supabase
          .from('users')
          .update({
            subscription_status: 'cancelled'
          })
          .eq('id', userId);
        
        if (userError) {
          console.warn(`Warning: Failed to update user record: ${userError.message}`);
        }
      }
      
      console.log('Subscription cancelled successfully:', data);
      
      return { success: true, data };
    } catch (err) {
      console.error('Error in cancelSubscription:', err);
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'An unknown error occurred' 
      };
    }
  };

  return {
    isProcessing,
    purchaseSubscription,
    fetchUserSubscription,
    getUserDashboardFeatures,
    cancelSubscription
  };
};

export default useSubscription;
