
import { useState, useEffect } from 'react';
import { UserRole } from '@/types/auth';
import { isInfluencer } from '@/utils/roleUtils';

// Types for dashboard services
export type DashboardService = string;

// Default service lists based on role
const defaultInfluencerServices: DashboardService[] = [
  'reels',
  'creatives',
  'ratings',
  'seo',
  'google_listing',
  'performance',
  'leads',
  'rank'
];

const defaultBusinessServices: DashboardService[] = [
  'marketing',
  'reels',
  'creatives',
  'ratings',
  'seo',
  'google_listing',
  'growth',
  'leads',
  'reach'
];

/**
 * Custom hook to get dashboard services for a user based on their role and subscription
 */
export const useDashboardServices = (
  userId: string,
  role: UserRole
): {
  services: DashboardService[];
  isLoading: boolean;
  error: string | null;
} => {
  const [services, setServices] = useState<DashboardService[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchServices = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // In a real app, this would be an API call to get services based on
        // the user's subscription or metadata
        let userServices: DashboardService[] = [];
        
        // Wait briefly to simulate network request
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Based on role, get default services
        if (isInfluencer(role)) {
          userServices = [...defaultInfluencerServices];
        } else {
          userServices = [...defaultBusinessServices];
        }
        
        setServices(userServices);
      } catch (err) {
        console.error('Error fetching dashboard services:', err);
        setError('Failed to load dashboard services');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchServices();
  }, [userId, role]);
  
  return { services, isLoading, error };
};

export default useDashboardServices;
