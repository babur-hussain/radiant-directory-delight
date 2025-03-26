
import { useState, useEffect, useCallback } from 'react';
import { User, UserSubscription } from '@/types/auth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

// Define Package type
export interface Package {
  id: string;
  title: string;
  price: number;
  duration_months: number;
  type?: string;
  features?: string;
  payment_type?: string;
}

export interface UseSubscriptionAssignmentReturn {
  isLoading: boolean;
  error: Error | null;
  packages: Package[];
  selectedPackageId: string;
  setSelectedPackageId: (id: string) => void;
  userCurrentSubscription: UserSubscription | null;
  handleAssignPackage: () => Promise<boolean>;
  handleCancelSubscription: () => Promise<boolean>;
}

export function useSubscriptionAssignment(
  user: User,
  onAssigned?: (packageId: string) => void
): UseSubscriptionAssignmentReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [packages, setPackages] = useState<Package[]>([]);
  const [selectedPackageId, setSelectedPackageId] = useState<string>('');
  const [userCurrentSubscription, setUserCurrentSubscription] = useState<UserSubscription | null>(null);
  const { toast } = useToast();

  // Load packages
  useEffect(() => {
    const loadPackages = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const { data, error } = await supabase
          .from('subscription_packages')
          .select('id, title, price, duration_months, type, features, payment_type')
          .order('price', { ascending: true });
        
        if (error) throw error;
        
        setPackages(data || []);
      } catch (err) {
        console.error('Error loading packages:', err);
        setError(err instanceof Error ? err : new Error('Failed to load subscription packages'));
      } finally {
        setIsLoading(false);
      }
    };
    
    loadPackages();
  }, []);
  
  // Load user's current subscription
  useEffect(() => {
    const loadUserSubscription = async () => {
      if (!user?.id) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        const { data, error } = await supabase
          .from('user_subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        
        if (error) throw error;
        
        if (data) {
          // Transform from snake_case to camelCase
          const subscription: UserSubscription = {
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
            createdAt: data.created_at,
            updatedAt: data.updated_at,
            cancelledAt: data.cancelled_at,
            cancelReason: data.cancel_reason,
            assignedBy: data.assigned_by,
            assignedAt: data.assigned_at,
            advancePaymentMonths: data.advance_payment_months,
            isParused: data.is_paused,
            paymentType: data.payment_type || 'recurring'
          };
          
          setUserCurrentSubscription(subscription);
        } else {
          setUserCurrentSubscription(null);
        }
      } catch (err) {
        console.error('Error loading user subscription:', err);
        setError(err instanceof Error ? err : new Error('Failed to load subscription details'));
      } finally {
        setIsLoading(false);
      }
    };
    
    loadUserSubscription();
  }, [user?.id]);
  
  // Handle assigning a package to user
  const handleAssignPackage = useCallback(async (): Promise<boolean> => {
    if (!user?.id || !selectedPackageId) {
      toast({
        title: "Error",
        description: "Missing user ID or package selection",
        variant: "destructive"
      });
      return false;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Get selected package details
      const selectedPackage = packages.find(pkg => pkg.id === selectedPackageId);
      if (!selectedPackage) {
        throw new Error("Selected package not found");
      }
      
      // Calculate start and end dates
      const startDate = new Date().toISOString();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + (selectedPackage.duration_months || 12));
      
      // Create subscription in Supabase
      const subscriptionId = `sub_${Date.now()}`;
      const { error } = await supabase
        .from('user_subscriptions')
        .insert({
          id: subscriptionId,
          user_id: user.id,
          package_id: selectedPackage.id,
          package_name: selectedPackage.title,
          amount: selectedPackage.price,
          start_date: startDate,
          end_date: endDate.toISOString(),
          status: 'active',
          payment_type: selectedPackage.payment_type || 'recurring',
          created_at: new Date().toISOString()
        });
      
      if (error) throw error;
      
      // Update user record
      const { error: userError } = await supabase
        .from('users')
        .update({
          subscription: subscriptionId,
          subscription_id: subscriptionId,
          subscription_status: 'active',
          subscription_package: selectedPackage.id
        })
        .eq('id', user.id);
      
      if (userError) throw userError;
      
      toast({
        title: "Subscription Assigned",
        description: `${selectedPackage.title} has been assigned successfully`,
      });
      
      // Refresh subscription data
      const { data: newSubscription } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('id', subscriptionId)
        .single();
      
      if (newSubscription) {
        setUserCurrentSubscription({
          id: newSubscription.id,
          userId: newSubscription.user_id,
          packageId: newSubscription.package_id,
          packageName: newSubscription.package_name,
          amount: newSubscription.amount,
          startDate: newSubscription.start_date,
          endDate: newSubscription.end_date,
          status: newSubscription.status,
          paymentType: newSubscription.payment_type
        });
      }
      
      // Call the callback if provided
      if (onAssigned) {
        onAssigned(selectedPackageId);
      }
      
      return true;
    } catch (err) {
      console.error('Error assigning subscription:', err);
      setError(err instanceof Error ? err : new Error('Failed to assign subscription'));
      
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'Failed to assign subscription',
        variant: "destructive"
      });
      
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, selectedPackageId, packages, onAssigned, toast]);
  
  // Handle cancelling a subscription
  const handleCancelSubscription = useCallback(async (): Promise<boolean> => {
    if (!user?.id || !userCurrentSubscription?.id) {
      toast({
        title: "Error",
        description: "No active subscription to cancel",
        variant: "destructive"
      });
      return false;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Update subscription status
      const now = new Date().toISOString();
      const { error } = await supabase
        .from('user_subscriptions')
        .update({
          status: 'cancelled',
          cancelled_at: now,
          cancel_reason: 'admin_cancelled',
          updated_at: now
        })
        .eq('id', userCurrentSubscription.id);
      
      if (error) throw error;
      
      // Update user record
      const { error: userError } = await supabase
        .from('users')
        .update({
          subscription_status: 'cancelled'
        })
        .eq('id', user.id);
      
      if (userError) throw userError;
      
      toast({
        title: "Subscription Cancelled",
        description: "The subscription has been cancelled successfully",
      });
      
      // Update local state
      setUserCurrentSubscription({
        ...userCurrentSubscription,
        status: 'cancelled',
        cancelledAt: now,
        cancelReason: 'admin_cancelled',
        updatedAt: now
      });
      
      return true;
    } catch (err) {
      console.error('Error cancelling subscription:', err);
      setError(err instanceof Error ? err : new Error('Failed to cancel subscription'));
      
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'Failed to cancel subscription',
        variant: "destructive"
      });
      
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, userCurrentSubscription, toast]);

  return {
    isLoading,
    error,
    packages,
    selectedPackageId,
    setSelectedPackageId,
    userCurrentSubscription,
    handleAssignPackage,
    handleCancelSubscription
  };
}
