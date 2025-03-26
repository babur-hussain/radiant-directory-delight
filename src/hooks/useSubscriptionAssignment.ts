
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { UserSubscription } from '@/types/auth';
import { generateId } from '@/lib/utils';

// Define the SubscriptionStatus type as a union of string literals
export type SubscriptionStatus = 'active' | 'expired' | 'cancelled' | 'pending';

interface UseSubscriptionAssignmentProps {
  userId: string;
}

const useSubscriptionAssignment = ({ userId }: UseSubscriptionAssignmentProps) => {
  const [selectedPackage, setSelectedPackage] = useState<{ id: string; title: string; price: number } | null>(null);
  const [userCurrentSubscription, setUserCurrentSubscription] = useState<UserSubscription | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCancelSubmitting, setIsCancelSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchCurrentSubscription = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const { data, error } = await supabase
          .from('user_subscriptions')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(1);

        if (error) {
          throw error;
        }

        if (data && data.length > 0) {
          const subscription = data[0];
          const status: SubscriptionStatus = (subscription.status as SubscriptionStatus) || 'active';
          
          setUserCurrentSubscription({
            id: subscription.id || '',
            userId: subscription.user_id,
            packageId: subscription.package_id,
            packageName: subscription.package_name,
            status: status,
            startDate: subscription.start_date,
            endDate: subscription.end_date,
            price: subscription.amount,
            paymentType: subscription.payment_type || '',
            cancelledAt: subscription.cancelled_at,
            cancelReason: subscription.cancel_reason,
            transactionId: subscription.transaction_id
          });
        } else {
          setUserCurrentSubscription(null);
        }
      } catch (err) {
        console.error("Error fetching current subscription:", err);
        setError(err instanceof Error ? err.message : "Failed to load subscription");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCurrentSubscription();
  }, [userId]);

  const handleAssignPackage = async (userId: string, months: number = 1): Promise<boolean> => {
    try {
      setIsSubmitting(true);
      
      if (!selectedPackage) {
        toast({
          title: "No Package Selected",
          description: "Please select a subscription package",
          variant: "destructive"
        });
        return false;
      }
      
      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + months);
      
      const newSubscription = {
        id: generateId(),
        user_id: userId,
        package_id: selectedPackage.id,
        package_name: selectedPackage.title,
        amount: selectedPackage.price,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        status: 'active' as SubscriptionStatus,
        payment_type: "recurring",
        created_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('user_subscriptions')
        .insert([newSubscription])
        .select();
        
      if (error) {
        throw error;
      }
      
      // Optionally, fetch the newly inserted subscription to get all columns
      const { data: insertedData, error: selectError } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('id', newSubscription.id)
        .single();
      
      if (selectError) {
        console.error("Error fetching inserted subscription:", selectError);
      }
      
      toast({
        title: "Package Assigned",
        description: "The subscription package has been successfully assigned.",
      });
      
      setUserCurrentSubscription({
        id: newSubscription.id || '',
        userId: newSubscription.user_id,
        packageId: newSubscription.package_id,
        packageName: newSubscription.package_name,
        status: 'active',
        startDate: newSubscription.start_date,
        endDate: newSubscription.end_date,
        price: newSubscription.amount,
        paymentType: newSubscription.payment_type || '',
        cancelledAt: null,
        cancelReason: null,
        transactionId: null
      });
      
      return true;
    } catch (error) {
      console.error("Error assigning package:", error);
      toast({
        title: "Error Assigning Package",
        description: "Failed to assign the subscription package. Please try again.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelSubscription = async (userId: string, reason?: string): Promise<boolean> => {
    try {
      setIsCancelSubmitting(true);

      if (!userCurrentSubscription) {
        toast({
          title: "No Active Subscription",
          description: "There is no active subscription to cancel.",
          variant: "destructive"
        });
        return false;
      }

      const cancelledStatus: SubscriptionStatus = 'cancelled';
      
      const { data, error } = await supabase
        .from('user_subscriptions')
        .update({
          status: cancelledStatus,
          cancelled_at: new Date().toISOString(),
          cancel_reason: reason || 'Cancelled by admin'
        })
        .eq('user_id', userId)
        .eq('id', userCurrentSubscription.id)
        .select();

      if (error) {
        throw error;
      }

      toast({
        title: "Subscription Cancelled",
        description: "The subscription has been successfully cancelled.",
      });
      
      // Update the current subscription status
      if (userCurrentSubscription) {
        setUserCurrentSubscription({
          ...userCurrentSubscription,
          status: cancelledStatus,
          cancelReason: reason || 'Cancelled by admin',
          cancelledAt: new Date().toISOString()
        });
      }

      return true;
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      toast({
        title: "Error Cancelling Subscription",
        description: "Failed to cancel the subscription. Please try again.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsCancelSubmitting(false);
    }
  };

  return {
    selectedPackage,
    setSelectedPackage,
    userCurrentSubscription,
    setUserCurrentSubscription,
    isSubmitting,
    isLoading,
    error,
    handleAssignPackage,
    handleCancelSubscription,
    isCancelSubmitting
  };
};

export default useSubscriptionAssignment;
