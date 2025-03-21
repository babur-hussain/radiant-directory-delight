import { useState } from 'react';
import { nanoid } from 'nanoid';
import { supabase } from '@/integrations/supabase/client';
import { ISubscription, PaymentType, BillingCycle, SubscriptionStatus } from '@/models/Subscription';
import { ISubscriptionPackage } from '@/models/SubscriptionPackage';
import { useToast } from '@/hooks/use-toast';

const useAdminSubscriptionAssignment = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const assignSubscription = async (userId: string, packageData: ISubscriptionPackage) => {
    setIsLoading(true);
    setError(null);
    
    if (!userId || !packageData) {
      setError('User ID and Package Data are required');
      setIsLoading(false);
      return;
    }
    
    try {
      // Create a new subscription
      const now = new Date();
      const endDate = new Date(now);
      endDate.setMonth(now.getMonth() + (packageData.durationMonths || 12));
      
      // Set up subscription data with proper types
      const subscriptionData: ISubscription = {
        id: nanoid(),
        userId,
        packageId: packageData.id,
        packageName: packageData.title,
        amount: packageData.price,
        startDate: now.toISOString(),
        endDate: endDate.toISOString(),
        status: 'active',
        paymentType: packageData.paymentType as PaymentType || 'recurring',
        billingCycle: packageData.billingCycle as BillingCycle,
        signupFee: packageData.setupFee || 0
      };
      
      const { data, error } = await supabase
        .from('user_subscriptions')
        .insert([
          {
            id: subscriptionData.id,
            user_id: subscriptionData.userId,
            package_id: subscriptionData.packageId,
            package_name: subscriptionData.packageName,
            status: subscriptionData.status,
            start_date: subscriptionData.startDate,
            end_date: subscriptionData.endDate,
            amount: subscriptionData.amount,
            payment_type: subscriptionData.paymentType,
            billing_cycle: subscriptionData.billingCycle,
            signup_fee: subscriptionData.signupFee
          }
        ]);
      
      if (error) {
        console.error('Error assigning subscription:', error);
        setError(`Failed to assign subscription: ${error.message}`);
        return;
      }
      
      toast({
        title: "Subscription Assigned",
        description: `Subscription assigned to user ${userId} successfully.`,
      });
    } catch (e) {
      console.error('Error assigning subscription:', e);
      setError(`Failed to assign subscription: ${e}`);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSubscriptionStatus = async (subscription: ISubscription) => {
    setIsLoading(true);
    setError(null);
    
    if (!subscription) {
      setError('Subscription data is required');
      setIsLoading(false);
      return;
    }
    
    try {
      const newStatus: SubscriptionStatus = subscription.status === 'active' ? 'paused' : 'active';
      
      const { data, error } = await supabase
        .from('user_subscriptions')
        .update({ status: newStatus })
        .eq('id', subscription.id);
      
      if (error) {
        console.error('Error toggling subscription status:', error);
        setError(`Failed to toggle subscription status: ${error.message}`);
        return;
      }
      
      toast({
        title: "Subscription Status Updated",
        description: `Subscription status updated to ${newStatus}.`,
      });
    } catch (e) {
      console.error('Error toggling subscription status:', e);
      setError(`Failed to toggle subscription status: ${e}`);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    assignSubscription,
    toggleSubscriptionStatus
  };
};

export default useAdminSubscriptionAssignment;
