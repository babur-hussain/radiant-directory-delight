
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSubscription } from '@/hooks/useSubscription';

export const useDashboardServices = (userId: string, userRole: string) => {
  const [services, setServices] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { fetchUserSubscription } = useSubscription(userId);
  
  useEffect(() => {
    const fetchServices = async () => {
      if (!userId) {
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      
      try {
        // First get the user's active subscription
        const subscriptionResult = await fetchUserSubscription(userId);
        
        if (!subscriptionResult.success || !subscriptionResult.data) {
          setServices([]);
          setIsLoading(false);
          return;
        }
        
        // Get the subscription package
        const { data: packageData, error: packageError } = await supabase
          .from('subscription_packages')
          .select('dashboard_sections')
          .eq('id', subscriptionResult.data.package_id)
          .single();
        
        if (packageError) {
          throw new Error(packageError.message);
        }
        
        // Set the services based on the package's dashboard sections
        if (packageData && packageData.dashboard_sections) {
          setServices(Array.isArray(packageData.dashboard_sections) ? 
            packageData.dashboard_sections : 
            []);
        } else {
          setServices([]);
        }
      } catch (err) {
        console.error('Error fetching dashboard services:', err);
        setError('Failed to load services. Please try again later.');
        setServices([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchServices();
  }, [userId, userRole, fetchUserSubscription]);
  
  return { services, isLoading, error };
};

export default useDashboardServices;
