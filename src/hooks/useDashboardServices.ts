
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
  const { userSubscription, loading: subscriptionLoading } = useSubscription();

  useEffect(() => {
    const fetchDashboardServices = async () => {
      try {
        setLoading(true);
        
        if (subscriptionLoading) {
          return;
        }
        
        if (!userSubscription) {
          setServices([]);
          return;
        }
        
        // Get allowed services from user's subscription package
        if (userSubscription.packageId) {
          // Here you would normally fetch the services from the API
          // For now we're just returning a hardcoded list
          const availableServices: DashboardService[] = [
            { id: 'seo', name: 'SEO Optimization', isActive: true, progress: 75, status: 'active' },
            { id: 'social-media', name: 'Social Media Management', isActive: true, progress: 90, status: 'active' },
            { id: 'content-creation', name: 'Content Creation', isActive: true, progress: 60, status: 'active' },
            { id: 'google-business', name: 'Google Business Profile', isActive: true, progress: 80, status: 'active' },
            { id: 'ad-campaigns', name: 'Ad Campaigns', isActive: true, progress: 30, status: 'pending' },
            { id: 'analytics', name: 'Analytics & Reporting', isActive: true, progress: 100, status: 'active' },
            { id: 'marketing', name: 'Marketing Campaigns', isActive: true, progress: 65, status: 'active' },
            { id: 'reels', name: 'Reels And Ads', isActive: true, progress: 70, status: 'active' },
            { id: 'creatives', name: 'Creative Designs', isActive: true, progress: 85, status: 'active' },
            { id: 'ratings', name: 'Business Ratings', isActive: true, progress: 95, status: 'active' },
            { id: 'google_listing', name: 'Google Business Listing', isActive: true, progress: 75, status: 'active' },
            { id: 'growth', name: 'Growth Analytics', isActive: true, progress: 60, status: 'active' },
            { id: 'leads', name: 'Leads And Inquiries', isActive: true, progress: 50, status: 'active' },
            { id: 'reach', name: 'Reach And Visibility', isActive: true, progress: 80, status: 'active' }
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
  }, [user, userSubscription, subscriptionLoading]);

  return { services, loading, error };
};

export default useDashboardServices;
