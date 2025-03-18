
import { useState, useEffect, useCallback } from 'react';
import { fetchBusinesses } from '@/lib/mongodb-utils';
import { IBusiness } from '@/models/Business';
import { autoInitMongoDB } from '@/utils/setupMongoDB';

export const useBusinessListings = () => {
  const [businesses, setBusinesses] = useState<IBusiness[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadBusinesses = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Ensure MongoDB is initialized before fetching data
      await autoInitMongoDB();
      
      // Fetch businesses from MongoDB
      const businessesData = await fetchBusinesses();
      
      if (businessesData && businessesData.length > 0) {
        setBusinesses(businessesData);
        console.log(`Loaded ${businessesData.length} businesses from MongoDB`);
      } else {
        console.warn('No businesses found in MongoDB');
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
      // Fetch businesses from MongoDB
      const businessesData = await fetchBusinesses();
      
      if (businessesData && businessesData.length > 0) {
        setBusinesses(businessesData);
        console.log(`Refreshed ${businessesData.length} businesses from MongoDB`);
      } else {
        console.warn('No businesses found in MongoDB during refresh');
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
