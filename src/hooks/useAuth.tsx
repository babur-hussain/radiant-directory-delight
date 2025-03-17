
import { useContext } from 'react';
import { AuthContext } from '../providers/AuthProvider';
import { AuthContextType } from '@/types/auth';

// Custom hook to use the auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

export default useAuth;
