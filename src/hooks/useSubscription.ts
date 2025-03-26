
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { nanoid } from 'nanoid';
import { ISubscriptionPackage } from '@/models/SubscriptionPackage';

export const useSubscription = (userId?: string) => {
  const [isProcessing, setIsProcessing] = useState(false);
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
        userId: currentUserId,
        packageId: packageData.id,
        packageName: packageData.title,
        amount: packageData.price + (packageData.setupFee || 0),
        startDate: new Date().toISOString(),
        endDate: getEndDate(packageData),
        status: 'active',
        paymentMethod: 'razorpay',
        paymentType: packageData.paymentType,
        billingCycle: packageData.billingCycle,
        signupFee: packageData.setupFee,
        recurringAmount: packageData.price,
        isPaused: false,
        isPausable: true,
        isUserCancellable: true,
        assignedBy: 'system',
      };

      // Call the subscription service to create the subscription
      const { data, error } = await supabase
        .from('user_subscriptions')
        .insert([{
          id: subscription.id,
          user_id: subscription.userId,
          package_id: subscription.packageId,
          package_name: subscription.packageName,
          amount: subscription.amount,
          start_date: subscription.startDate,
          end_date: subscription.endDate,
          status: subscription.status,
          payment_method: subscription.paymentMethod,
          payment_type: subscription.paymentType,
          billing_cycle: subscription.billingCycle,
          signup_fee: subscription.signupFee,
          recurring_amount: subscription.recurringAmount,
          is_paused: subscription.isPaused,
          is_pausable: subscription.isPausable,
          is_user_cancellable: subscription.isUserCancellable,
          assigned_by: subscription.assignedBy,
          created_at: new Date().toISOString()
        }])
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
          subscription_package: subscription.packageId
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
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching user subscription:', error);
        return { success: false, error: error.message };
      }
      
      return { success: true, data };
    } catch (error) {
      console.error('Error in fetchUserSubscription:', error);
      return { success: false, error: 'Failed to fetch subscription' };
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
        .select('dashboardSections')
        .eq('id', subscription.package_id)
        .single();
      
      if (packageError) {
        console.error('Error fetching package data:', packageError);
        return { success: false, services: [] };
      }
      
      return { 
        success: true, 
        services: packageData.dashboardSections || [] 
      };
    } catch (error) {
      console.error('Error in getUserDashboardFeatures:', error);
      return { success: false, services: [] };
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
  };
};

export default useSubscription;
