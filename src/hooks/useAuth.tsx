
import { useContext } from 'react';
import { AuthContext } from '@/providers/AuthProvider';
import type { AuthContextType } from '@/types/auth';

// Export just the hook function
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};
