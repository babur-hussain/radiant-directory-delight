
import { useState, useEffect } from 'react';
import { getUserById } from '@/features/auth/userDataAccess';
import { User } from '@/types/auth';

/**
 * Hook to fetch a user profile by ID
 */
export const useUserProfile = (userId: string) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      if (!userId) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const userProfile = await getUserById(userId);
        setUser(userProfile);
        setError(null);
      } catch (err) {
        console.error("Error fetching user profile:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  return {
    user,
    loading,
    error,
    refetch: async () => {
      setLoading(true);
      try {
        const userProfile = await getUserById(userId);
        setUser(userProfile);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setLoading(false);
      }
    }
  };
};

export default useUserProfile;
