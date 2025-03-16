
import { useContext } from 'react';
import { AuthContext } from '../providers/AuthProvider';
import { AuthContextType } from '@/types/auth';

// Custom hook to use the auth context
export const useAuth = (): AuthContextType => {
  return useContext(AuthContext);
};

export default useAuth;
