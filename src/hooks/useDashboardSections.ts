
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSubscription } from '@/hooks/useSubscription';

export const useDashboardSections = (userId: string) => {
  const [dashboardSections, setDashboardSections] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { fetchUserSubscription } = useSubscription(userId);
  
  useEffect(() => {
    const fetchSections = async () => {
      if (!userId) {
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      
      try {
        // First get the user's active subscription
        const subscriptionResult = await fetchUserSubscription(userId);
        
        if (!subscriptionResult.success || !subscriptionResult.data || subscriptionResult.data.status !== 'active') {
          setDashboardSections([]);
          setIsLoading(false);
          return;
        }
        
        // Get the subscription package details
        const { data: packageData, error: packageError } = await supabase
          .from('subscription_packages')
          .select('dashboard_sections')
          .eq('id', subscriptionResult.data.package_id)
          .single();
        
        if (packageError) {
          console.error("Error fetching package dashboard sections:", packageError);
          setError(packageError.message);
          setDashboardSections([]);
          return;
        }
        
        if (packageData && packageData.dashboard_sections) {
          setDashboardSections(packageData.dashboard_sections);
        } else {
          setDashboardSections([]);
        }
      } catch (err) {
        console.error("Error in useDashboardSections:", err);
        setError(err instanceof Error ? err.message : "An unknown error occurred");
        setDashboardSections([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSections();
  }, [userId, fetchUserSubscription]);
  
  return { dashboardSections, isLoading, error };
};
