
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useDashboardServices = (userId: string, userRole: string) => {
  const [services, setServices] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchServices = async () => {
      if (!userId) {
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      
      try {
        // First get the user's active subscription
        const { data: subscription, error: subError } = await supabase
          .from('user_subscriptions')
          .select('*')
          .eq('user_id', userId)
          .eq('status', 'active')
          .maybeSingle();
        
        if (subError) {
          throw new Error(subError.message);
        }
        
        if (!subscription) {
          setServices([]);
          return;
        }
        
        // Get the subscription package
        const { data: packageData, error: packageError } = await supabase
          .from('subscription_packages')
          .select('dashboardSections')
          .eq('id', subscription.package_id)
          .single();
        
        if (packageError) {
          throw new Error(packageError.message);
        }
        
        // Set the services based on the package's dashboard sections
        setServices(packageData.dashboardSections || []);
      } catch (err) {
        console.error('Error fetching dashboard services:', err);
        setError('Failed to load services. Please try again later.');
        setServices([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchServices();
  }, [userId, userRole]);
  
  return { services, isLoading, error };
};

export default useDashboardServices;
