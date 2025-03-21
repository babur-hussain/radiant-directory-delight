
import { useState, useEffect } from 'react';
import { User, UserSubscription } from '@/types/auth';
import { useSubscriptionPackages } from '@/hooks/useSubscriptionPackages';
import { supabase } from '@/integrations/supabase/client';
import { nanoid } from 'nanoid';
import { useToast } from '@/hooks/use-toast';
import { PaymentType } from '@/models/Subscription';

interface SubscriptionAssignment {
  userId: string;
  subscriptionId: string;
  assignedBy: string;
  assignedAt: string;
  status: 'active' | 'inactive' | 'pending';
}

export const useSubscriptionAssignment = (
  user: User,
  onSuccess?: (packageId: string) => void
) => {
  const [assignments, setAssignments] = useState<SubscriptionAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<string>('');
  const [userCurrentSubscription, setUserCurrentSubscription] = useState<UserSubscription | null>(null);
  const { packages } = useSubscriptionPackages();
  const { toast } = useToast();

  // Fetch current user's subscription
  useEffect(() => {
    const fetchUserSubscription = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Get active subscription for this user
        const { data, error } = await supabase
          .from('user_subscriptions')
          .select('*')
          .eq('user_id', user.uid)
          .order('created_at', { ascending: false })
          .maybeSingle();
        
        if (error) throw error;
        
        if (data) {
          setUserCurrentSubscription({
            id: data.id,
            userId: data.user_id,
            packageId: data.package_id,
            packageName: data.package_name,
            amount: data.amount,
            startDate: data.start_date,
            endDate: data.end_date,
            status: data.status,
            paymentMethod: data.payment_method,
            transactionId: data.transaction_id,
            cancelledAt: data.cancelled_at,
            cancelReason: data.cancel_reason,
            paymentType: data.payment_type as PaymentType
          });
        }
      } catch (err) {
        console.error('Error fetching user subscription:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch subscription');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (user?.uid) {
      fetchUserSubscription();
    }
  }, [user]);

  const assignSubscription = (userId: string, subscriptionId: string, assignedBy: string) => {
    const newAssignment: SubscriptionAssignment = {
      userId,
      subscriptionId,
      assignedBy,
      assignedAt: new Date().toISOString(),
      status: 'active',
    };

    setAssignments([...assignments, newAssignment]);
  };

  const updateAssignmentStatus = (userId: string, status: 'active' | 'inactive' | 'pending') => {
    setAssignments(
      assignments.map((assignment) =>
        assignment.userId === userId ? { ...assignment, status } : assignment
      )
    );
  };

  // Handle package assignment
  const handleAssignPackage = async () => {
    if (!selectedPackage) {
      setError('Please select a package to assign');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Find the package details
      const packageToAssign = packages.find(pkg => pkg.id === selectedPackage);
      if (!packageToAssign) throw new Error('Selected package not found');
      
      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + (packageToAssign.durationMonths || 12));
      
      const subscriptionData = {
        id: nanoid(),
        user_id: user.uid,
        package_id: packageToAssign.id,
        package_name: packageToAssign.title,
        amount: packageToAssign.price,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        status: 'active',
        payment_type: packageToAssign.paymentType as PaymentType || 'recurring',
        assigned_at: startDate.toISOString(),
        assigned_by: 'admin'
      };
      
      const { data, error: insertError } = await supabase
        .from('user_subscriptions')
        .upsert(subscriptionData)
        .select();
      
      if (insertError) throw insertError;
      
      // Update local state
      setUserCurrentSubscription({
        id: subscriptionData.id,
        userId: subscriptionData.user_id,
        packageId: subscriptionData.package_id,
        packageName: subscriptionData.package_name,
        amount: subscriptionData.amount,
        startDate: subscriptionData.start_date,
        endDate: subscriptionData.end_date,
        status: subscriptionData.status,
        paymentType: subscriptionData.payment_type
      });
      
      // Assign locally as well
      assignSubscription(user.uid, packageToAssign.id, 'admin');
      
      toast({
        title: 'Subscription Assigned',
        description: `Successfully assigned ${packageToAssign.title} to ${user.name || user.email}`,
      });
      
      if (onSuccess) onSuccess(packageToAssign.id);
    } catch (err) {
      console.error('Error assigning subscription:', err);
      setError(err instanceof Error ? err.message : 'Failed to assign subscription');
      
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to assign subscription',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle subscription cancellation
  const handleCancelSubscription = async () => {
    if (!userCurrentSubscription) {
      setError('No active subscription to cancel');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const { error: updateError } = await supabase
        .from('user_subscriptions')
        .update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString()
        })
        .eq('id', userCurrentSubscription.id);
      
      if (updateError) throw updateError;
      
      // Update local state
      setUserCurrentSubscription({
        ...userCurrentSubscription,
        status: 'cancelled',
        cancelledAt: new Date().toISOString()
      });
      
      toast({
        title: 'Subscription Cancelled',
        description: `Successfully cancelled subscription for ${user.name || user.email}`,
      });
    } catch (err) {
      console.error('Error cancelling subscription:', err);
      setError(err instanceof Error ? err.message : 'Failed to cancel subscription');
      
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to cancel subscription',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    assignments,
    assignSubscription,
    updateAssignmentStatus,
    isLoading,
    error,
    packages,
    selectedPackage,
    setSelectedPackage,
    userCurrentSubscription,
    handleAssignPackage,
    handleCancelSubscription
  };
};
