
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { User, UserSubscription, SubscriptionStatus } from '@/types/auth';

interface Package {
  id: string;
  title: string;
  price: number;
  shortDescription?: string;
  fullDescription?: string;
  features?: string[];
  duration?: number;
  durationMonths?: number;
  paymentType?: string;
  billingCycle?: string;
  setupFee?: number;
  popular?: boolean;
}

export interface UseSubscriptionAssignmentReturn {
  isLoading: boolean;
  error: Error | null;
  packages: Package[];
  selectedPackage: Package | null;
  setSelectedPackage: (pkg: Package | null) => void;
  userCurrentSubscription: UserSubscription | null;
  handleAssignPackage: (userId: string, months?: number) => Promise<boolean>;
  handleCancelSubscription: (userId: string, reason?: string) => Promise<boolean>;
  generateAdvancePaymentOptions: (pkg: Package) => { value: number; label: string }[];
}

export const useSubscriptionAssignment = (user?: User | null): UseSubscriptionAssignmentReturn => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [userCurrentSubscription, setUserCurrentSubscription] = useState<UserSubscription | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  // Fetch all available packages
  useEffect(() => {
    const fetchPackages = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const { data, error } = await supabase
          .from('subscription_packages')
          .select('*')
          .order('price', { ascending: true });
          
        if (error) throw new Error(error.message);
        
        if (data) {
          const transformedPackages: Package[] = data.map(pkg => ({
            id: pkg.id,
            title: pkg.title,
            price: pkg.price || 0,
            shortDescription: pkg.short_description,
            fullDescription: pkg.full_description,
            features: pkg.features ? pkg.features.split('\n') : [],
            durationMonths: pkg.duration_months || 12,
            paymentType: pkg.payment_type || 'recurring',
            billingCycle: pkg.billing_cycle,
            setupFee: pkg.setup_fee || 0,
            popular: pkg.popular || false,
          }));
          
          setPackages(transformedPackages);
        }
      } catch (err) {
        console.error('Error fetching packages:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch packages'));
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPackages();
  }, []);
  
  // Fetch user's current subscription if user is provided
  useEffect(() => {
    const fetchUserSubscription = async () => {
      if (!user?.id) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const { data, error } = await supabase
          .from('user_subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
          
        if (error && error.code !== 'PGRST116') { // No rows returned is not an error for us
          throw new Error(error.message);
        }
        
        if (data) {
          const subscription: UserSubscription = {
            id: data.id,
            userId: data.user_id,
            packageId: data.package_id,
            packageName: data.package_name,
            status: data.status as SubscriptionStatus,
            startDate: data.start_date,
            endDate: data.end_date,
            price: data.amount,
            paymentMethod: data.payment_method
          };
          
          setUserCurrentSubscription(subscription);
        } else {
          setUserCurrentSubscription(null);
        }
      } catch (err) {
        console.error('Error fetching user subscription:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch user subscription'));
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserSubscription();
  }, [user]);
  
  // Assign a package to a user
  const handleAssignPackage = useCallback(async (userId: string, months: number = 0): Promise<boolean> => {
    if (!selectedPackage) {
      toast({
        title: "Error",
        description: "No package selected",
        variant: "destructive"
      });
      return false;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Calculate start and end dates
      const startDate = new Date();
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + (months || selectedPackage.durationMonths || 12));
      
      const subscriptionId = `sub_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      
      // Generate subscription data
      const subscriptionData = {
        id: subscriptionId,
        user_id: userId,
        package_id: selectedPackage.id,
        package_name: selectedPackage.title,
        amount: selectedPackage.price,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        status: 'active' as SubscriptionStatus,
        payment_type: selectedPackage.paymentType || 'recurring',
        created_at: new Date().toISOString()
      };
      
      const { error } = await supabase
        .from('user_subscriptions')
        .insert(subscriptionData);
        
      if (error) throw new Error(error.message);
      
      toast({
        title: "Success",
        description: `Successfully assigned ${selectedPackage.title} package to user`,
      });
      
      return true;
    } catch (err) {
      console.error('Error assigning package:', err);
      setError(err instanceof Error ? err : new Error('Failed to assign package'));
      
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'Failed to assign package',
        variant: "destructive"
      });
      
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [selectedPackage, toast]);
  
  // Cancel a user's subscription
  const handleCancelSubscription = useCallback(async (userId: string, reason?: string): Promise<boolean> => {
    if (!userCurrentSubscription) {
      toast({
        title: "Error",
        description: "No active subscription found",
        variant: "destructive"
      });
      return false;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase
        .from('user_subscriptions')
        .update({
          status: 'cancelled' as SubscriptionStatus,
          cancelled_at: new Date().toISOString(),
          cancel_reason: reason || 'Cancelled by admin'
        })
        .eq('id', userCurrentSubscription.id);
        
      if (error) throw new Error(error.message);
      
      toast({
        title: "Success",
        description: "Subscription cancelled successfully",
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
  }, [userCurrentSubscription, toast]);
  
  // Generate advance payment options
  const generateAdvancePaymentOptions = useCallback((pkg: Package) => {
    const options = [
      { value: 3, label: '3 months' },
      { value: 6, label: '6 months' },
      { value: 12, label: '1 year' }
    ];
    
    return options;
  }, []);
  
  return {
    isLoading,
    error,
    packages,
    selectedPackage,
    setSelectedPackage,
    userCurrentSubscription,
    handleAssignPackage,
    handleCancelSubscription,
    generateAdvancePaymentOptions
  };
};
