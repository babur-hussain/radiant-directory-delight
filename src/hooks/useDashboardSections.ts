
import { useState, useEffect } from 'react';
import { ISubscriptionPackage } from '@/models/SubscriptionPackage';
import { useSubscription } from './useSubscription';

export const useDashboardSections = (userId?: string) => {
  const { subscription } = useSubscription(userId);
  const [dashboardSections, setDashboardSections] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardSections = async () => {
      setIsLoading(true);
      try {
        if (subscription?.packageId) {
          // Fetch subscription package details to get dashboard sections
          const packageDetails = await fetch(`/api/subscription/package/${subscription.packageId}`);

          if (!packageDetails.ok) {
            throw new Error(`Failed to fetch package details: ${packageDetails.status}`);
          }

          const packageData: ISubscriptionPackage = await packageDetails.json();

          if (packageData && packageData.dashboardSections) {
            setDashboardSections(packageData.dashboardSections);
          } else {
            setDashboardSections([]); // Default to empty array if no sections are found
          }
        } else {
          setDashboardSections([]); // No subscription, no sections
        }
        setIsLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard sections');
        setIsLoading(false);
      }
    };

    fetchDashboardSections();
  }, [subscription?.packageId]);

  return { dashboardSections, isLoading, error };
};
