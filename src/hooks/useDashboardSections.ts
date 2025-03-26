
import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { useSubscription } from './useSubscription';

export interface DashboardSection {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  type?: string;
  isVisible?: boolean;
  order?: number;
  component?: React.ComponentType<any>;
}

export const useDashboardSections = () => {
  const [sections, setSections] = useState<DashboardSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { subscription, loading: subscriptionLoading } = useSubscription();

  useEffect(() => {
    const fetchDashboardSections = async () => {
      try {
        setLoading(true);
        
        if (subscriptionLoading) {
          return;
        }
        
        if (!subscription) {
          setSections([]);
          return;
        }
        
        // Get allowed sections from user's subscription package
        if (subscription.packageId) {
          // Here you would normally fetch the sections from the API
          // For now we're just returning a hardcoded list
          const availableSections: DashboardSection[] = [
            { id: 'analytics', name: 'Analytics', icon: 'bar-chart' },
            { id: 'performance', name: 'Performance', icon: 'activity' },
            { id: 'seo', name: 'SEO', icon: 'search' },
            { id: 'leads', name: 'Leads', icon: 'users' },
            { id: 'campaigns', name: 'Campaigns', icon: 'megaphone' },
            { id: 'reels', name: 'Reels', icon: 'video' },
            { id: 'reviews', name: 'Reviews', icon: 'star' },
            { id: 'google-listing', name: 'Google Listing', icon: 'map-pin' }
          ];
          
          setSections(availableSections);
        } else {
          setSections([]);
        }
        
        setError(null);
      } catch (err) {
        console.error("Error fetching dashboard sections:", err);
        setError("Failed to load dashboard sections");
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardSections();
  }, [user, subscription, subscriptionLoading]);

  return { sections, loading, error };
};

export default useDashboardSections;
