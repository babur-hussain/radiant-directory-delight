
import { useState } from 'react';
import { User, UserRole, normalizeRole } from '@/types/auth';

export const useAdmin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const updateUserRole = async (userId: string, role: UserRole): Promise<User | null> => {
    setLoading(true);
    setError(null);
    
    try {
      // Normalize the role to ensure it's in the correct format
      const normalizedRole = normalizeRole(role);
      
      // Implementation would normally call an API or service
      console.log(`Setting user ${userId} role to ${normalizedRole}`);
      
      // Mock successful update
      const updatedUser: User = {
        id: userId,
        role: normalizedRole,
      };
      
      return updatedUser;
    } catch (err) {
      console.error("Error updating user role:", err);
      setError(err instanceof Error ? err : new Error('Failed to update user role'));
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  const updateUserPermission = async (userId: string, isAdmin: boolean): Promise<{ userId: string, isAdmin: boolean } | null> => {
    setLoading(true);
    setError(null);
    
    try {
      // Implementation would normally call an API or service
      console.log(`Setting user ${userId} admin permission to ${isAdmin}`);
      
      // Mock successful update
      return { userId, isAdmin };
    } catch (err) {
      console.error("Error updating user permission:", err);
      setError(err instanceof Error ? err : new Error('Failed to update user permission'));
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  return {
    loading,
    error,
    updateUserRole,
    updateUserPermission
  };
};

export default useAdmin;
