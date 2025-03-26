
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { User, UserSubscription } from '@/types/auth';
import { supabase } from '@/integrations/supabase/client';

interface Package {
  id: string;
  title: string;
  price: number;
  description?: string;
}

interface UseSubscriptionAssignmentReturn {
  subscription: UserSubscription | null;
  setSubscription: (subscription: UserSubscription) => void;
  assignSubscription: (transactionId: string) => void;
  isLoading: boolean;
  error: string | null;
  packages: Package[];
  selectedPackage: string;
  setSelectedPackage: (packageId: string) => void;
  userCurrentSubscription: UserSubscription | null;
  handleAssignPackage: () => Promise<void>;
  handleCancelSubscription: () => Promise<void>;
}

export const useSubscriptionAssignment = (
  user?: User,
  onAssigned?: (packageId: string) => void
): UseSubscriptionAssignmentReturn => {
  const { user: authUser } = useAuth();
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [packages, setPackages] = useState<Package[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<string>('');
  const [userCurrentSubscription, setUserCurrentSubscription] = useState<UserSubscription | null>(null);
  
  const { toast } = useToast();

  // Fetch available packages
  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const { data, error } = await supabase
          .from('subscription_packages')
          .select('id, title, price, description')
          .order('price', { ascending: true });
          
        if (error) throw error;
        setPackages(data || []);
      } catch (err) {
        console.error("Error fetching packages:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch subscription packages");
      }
    };
    
    fetchPackages();
  }, []);
  
  // Fetch user's current subscription
  useEffect(() => {
    const fetchUserSubscription = async () => {
      if (!user && !authUser) return;
      
      const userId = user?.id || authUser?.id;
      if (!userId) return;
      
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('user_subscriptions')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
          
        if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned" error
          throw error;
        }
        
        if (data) {
          setUserCurrentSubscription({
            id: data.id,
            userId: data.user_id,
            packageId: data.package_id,
            packageName: data.package_name,
            status: data.status,
            startDate: data.start_date,
            endDate: data.end_date,
            price: data.amount,
            paymentMethod: data.payment_method,
            paymentType: data.payment_type
          });
        }
      } catch (err) {
        console.error("Error fetching user subscription:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch user subscription");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserSubscription();
  }, [user, authUser]);

  const assignSubscription = (transactionId: string) => {
    if (!user && !authUser) {
      toast({
        title: "Not authenticated",
        description: "You must be logged in to assign a subscription.",
        variant: "destructive",
      });
      return;
    }

    setSubscription(prev => {
      if (!prev) return prev;
      
      // Create a new object that includes all properties from prev
      // and adds/updates the transaction_id property
      return {
        ...prev,
        status: 'active',
        transactionId: transactionId
      };
    });

    toast({
      title: "Subscription Assigned",
      description: `Subscription assigned successfully with transaction ID: ${transactionId}`,
    });
  };
  
  const handleAssignPackage = async () => {
    if (!selectedPackage) {
      setError("Please select a package");
      return;
    }
    
    const userId = user?.id || authUser?.id;
    if (!userId) {
      setError("User ID not found");
      return;
    }
    
    setIsLoading(true);
    try {
      const selectedPkg = packages.find(p => p.id === selectedPackage);
      if (!selectedPkg) throw new Error("Selected package not found");
      
      const now = new Date();
      const end = new Date();
      end.setMonth(end.getMonth() + 12); // Default 12 months subscription
      
      const { data, error } = await supabase
        .from('user_subscriptions')
        .insert({
          user_id: userId,
          package_id: selectedPkg.id,
          package_name: selectedPkg.title,
          amount: selectedPkg.price,
          start_date: now.toISOString(),
          end_date: end.toISOString(),
          status: 'active',
          payment_type: 'one-time',
          created_at: now.toISOString()
        })
        .select()
        .single();
        
      if (error) throw error;
      
      toast({
        title: "Subscription Assigned",
        description: `${selectedPkg.title} package has been assigned to the user.`
      });
      
      if (onAssigned) onAssigned(selectedPkg.id);
      
      setUserCurrentSubscription({
        id: data.id,
        userId: data.user_id,
        packageId: data.package_id,
        packageName: data.package_name,
        status: data.status,
        startDate: data.start_date,
        endDate: data.end_date,
        price: data.amount,
        paymentMethod: data.payment_method,
        paymentType: data.payment_type
      });
    } catch (err) {
      console.error("Error assigning package:", err);
      setError(err instanceof Error ? err.message : "Failed to assign subscription package");
      toast({
        title: "Error",
        description: "Failed to assign subscription. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCancelSubscription = async () => {
    if (!userCurrentSubscription) {
      setError("No active subscription found");
      return;
    }
    
    setIsLoading(true);
    try {
      const now = new Date();
      
      const { error } = await supabase
        .from('user_subscriptions')
        .update({
          status: 'cancelled',
          cancelled_at: now.toISOString(),
          updated_at: now.toISOString()
        })
        .eq('id', userCurrentSubscription.id);
        
      if (error) throw error;
      
      toast({
        title: "Subscription Cancelled",
        description: "The subscription has been cancelled."
      });
      
      setUserCurrentSubscription(prev => prev ? {...prev, status: 'cancelled'} : null);
    } catch (err) {
      console.error("Error cancelling subscription:", err);
      setError(err instanceof Error ? err.message : "Failed to cancel subscription");
      toast({
        title: "Error",
        description: "Failed to cancel subscription. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return { 
    subscription, 
    setSubscription, 
    assignSubscription,
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
