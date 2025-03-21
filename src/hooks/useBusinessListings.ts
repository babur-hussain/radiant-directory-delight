
import { useState, useEffect, useCallback } from 'react';
import { fetchBusinesses } from '@/lib/supabase/businessUtils';
import { IBusiness } from '@/models/Business';

export const useBusinessListings = () => {
  const [businesses, setBusinesses] = useState<IBusiness[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadBusinesses = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch businesses from Supabase
      const businessesData = await fetchBusinesses();
      
      if (businessesData && businessesData.length > 0) {
        setBusinesses(businessesData as IBusiness[]);
        console.log(`Loaded ${businessesData.length} businesses from Supabase`);
      } else {
        console.warn('No businesses found in Supabase');
        setBusinesses([]);
      }
    } catch (err) {
      console.error('Error loading businesses:', err);
      setError('Failed to load businesses. Please try again later.');
      setBusinesses([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshData = useCallback(async () => {
    setIsRefreshing(true);
    
    try {
      // Fetch businesses from Supabase
      const businessesData = await fetchBusinesses();
      
      if (businessesData && businessesData.length > 0) {
        setBusinesses(businessesData as IBusiness[]);
        console.log(`Refreshed ${businessesData.length} businesses from Supabase`);
      } else {
        console.warn('No businesses found in Supabase during refresh');
        setBusinesses([]);
      }
    } catch (err) {
      console.error('Error refreshing businesses:', err);
      setError('Failed to refresh businesses. Please try again later.');
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadBusinesses();
  }, [loadBusinesses]);

  return { businesses, isLoading, isRefreshing, error, refreshData };
};
