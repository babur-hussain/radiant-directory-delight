
// Re-export from the main auth hook for better organization
import { useAuth } from '@/hooks/useAuth';
import type { User, UserRole, AuthContextType } from '@/types/auth';

export { useAuth };
export type { User, UserRole, AuthContextType };
