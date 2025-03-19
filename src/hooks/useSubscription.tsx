
import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { getUserSubscription } from '@/lib/subscription/get-subscription';
import { ISubscription } from '@/models/Subscription';

export const useSubscription = () => {
  const { user, isAuthenticated } = useAuth();
  const [subscription, setSubscription] = useState<ISubscription | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchSubscription = async () => {
      if (!isAuthenticated || !user) {
        setSubscription(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const userSubscription = await getUserSubscription(user.uid);
        setSubscription(userSubscription);
      } catch (err) {
        console.error("Error fetching subscription:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
        setSubscription(null);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, [user, isAuthenticated]);

  return {
    subscription,
    loading,
    error,
    refresh: async () => {
      setLoading(true);
      try {
        if (user) {
          const userSubscription = await getUserSubscription(user.uid);
          setSubscription(userSubscription);
        }
      } catch (err) {
        console.error("Error refreshing subscription:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setLoading(false);
      }
    }
  };
};

export default useSubscription;
