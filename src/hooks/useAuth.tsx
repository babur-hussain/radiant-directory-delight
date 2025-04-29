
import React, { useContext } from 'react';
import { AuthContext } from '@/providers/AuthProvider';
import { AuthContextType } from '@/types/auth';

export { AuthProvider } from '@/providers/AuthProvider';
export { AuthContext } from '@/providers/AuthProvider';

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};
