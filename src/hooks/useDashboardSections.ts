
import { useState, useEffect } from 'react';
import { ISubscriptionPackage } from '@/models/SubscriptionPackage';
import { useSubscription } from './useSubscription';
import { supabase } from '@/integrations/supabase/client';

export const useDashboardSections = (userId?: string) => {
  const { fetchUserSubscription } = useSubscription(userId);
  const [dashboardSections, setDashboardSections] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardSections = async () => {
      setIsLoading(true);
      try {
        if (!userId) {
          setDashboardSections([]);
          setIsLoading(false);
          return;
        }
        
        const { success, data: subscription } = await fetchUserSubscription(userId);
        
        if (!success || !subscription || !subscription.package_id) {
          setDashboardSections([]);
          setIsLoading(false);
          return;
        }

        // Fetch subscription package details to get dashboard sections
        const { data: packageData, error: packageError } = await supabase
          .from('subscription_packages')
          .select('dashboard_sections')
          .eq('id', subscription.package_id)
          .single();

        if (packageError) {
          throw new Error(`Failed to fetch package details: ${packageError.message}`);
        }

        if (packageData && packageData.dashboard_sections) {
          setDashboardSections(packageData.dashboard_sections);
        } else {
          setDashboardSections([]); // Default to empty array if no sections are found
        }
        
        setIsLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard sections');
        setIsLoading(false);
      }
    };

    fetchDashboardSections();
  }, [userId, fetchUserSubscription]);

  return { dashboardSections, isLoading, error };
};

export default useDashboardSections;
