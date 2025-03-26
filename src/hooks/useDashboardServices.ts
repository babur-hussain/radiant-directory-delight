
import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { useSubscription } from './useSubscription';

export interface DashboardService {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  icon?: string;
  status?: 'active' | 'pending' | 'inactive';
  progress?: number;
  details?: Record<string, any>;
}

export const useDashboardServices = () => {
  const [services, setServices] = useState<DashboardService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { subscription, loading: subscriptionLoading } = useSubscription();

  useEffect(() => {
    const fetchDashboardServices = async () => {
      try {
        setLoading(true);
        
        if (subscriptionLoading) {
          return;
        }
        
        if (!subscription) {
          setServices([]);
          return;
        }
        
        // Get allowed services from user's subscription package
        if (subscription.packageId) {
          // Here you would normally fetch the services from the API
          // For now we're just returning a hardcoded list
          const availableServices: DashboardService[] = [
            { id: 'seo', name: 'SEO Optimization', isActive: true, progress: 75, status: 'active' },
            { id: 'social-media', name: 'Social Media Management', isActive: true, progress: 90, status: 'active' },
            { id: 'content-creation', name: 'Content Creation', isActive: true, progress: 60, status: 'active' },
            { id: 'google-business', name: 'Google Business Profile', isActive: true, progress: 80, status: 'active' },
            { id: 'ad-campaigns', name: 'Ad Campaigns', isActive: true, progress: 30, status: 'pending' },
            { id: 'analytics', name: 'Analytics & Reporting', isActive: true, progress: 100, status: 'active' }
          ];
          
          setServices(availableServices);
        } else {
          setServices([]);
        }
        
        setError(null);
      } catch (err) {
        console.error("Error fetching dashboard services:", err);
        setError("Failed to load dashboard services");
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardServices();
  }, [user, subscription, subscriptionLoading]);

  return { services, loading, error };
};

export default useDashboardServices;
