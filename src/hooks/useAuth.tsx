
import { useContext } from 'react';
import { AuthContext } from '../providers/AuthProvider';

// Custom hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};
