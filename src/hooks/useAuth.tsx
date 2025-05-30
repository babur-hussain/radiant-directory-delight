
import React, { useContext } from 'react';
import { AuthContext } from '@/providers/AuthProvider';
import { AuthContextType } from '@/types/auth';

export { AuthProvider } from '@/providers/AuthProvider';
export { AuthContext } from '@/providers/AuthProvider';

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider. Make sure your component is wrapped with AuthProvider.');
  }
  
  return context;
};

// Hook for checking if user is authenticated
export const useIsAuthenticated = (): boolean => {
  const { user, isLoading } = useAuth();
  return !isLoading && !!user;
};

// Hook for checking user role
export const useUserRole = (): string | null => {
  const { user } = useAuth();
  return user?.role || null;
};

// Hook for checking if user has specific role
export const useHasRole = (role: string): boolean => {
  const userRole = useUserRole();
  return userRole === role;
};
