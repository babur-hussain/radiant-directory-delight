
import { supabase } from '@/integrations/supabase/client';
import { User, UserRole } from '@/types/auth';
import * as supabaseUserUtils from '../supabase/userUtils';

// Re-export functions for backwards compatibility
export const { fetchUserByUid } = supabaseUserUtils;

// Helper function to convert role string to UserRole type
function transformRole(role: string | null): UserRole {
  if (!role) return null;
  
  // Match with expected UserRole values
  switch (role.toLowerCase()) {
    case 'admin':
      return 'Admin';
    case 'business':
      return 'Business';
    case 'influencer':
      return 'Influencer';
    case 'user':
      return 'User';
    case 'staff':
      return 'Staff';
    default:
      return 'User'; // Default to User if unknown
  }
}

// We remove the duplicated fetchUserByUid function here
