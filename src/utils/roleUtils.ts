
import { UserRole } from '@/types/auth';

// Helper function to normalize role for comparison
export const normalizeRole = (role: string | undefined): string => {
  if (!role) return '';
  return role.toLowerCase();
};

// Helper function to compare roles safely
export const isSameRole = (roleA: string | undefined, roleB: string | undefined): boolean => {
  return normalizeRole(roleA) === normalizeRole(roleB);
};

// Convert between capitalized and lowercase role formats
export const capitalizeRole = (role: UserRole): string => {
  if (!role) return '';
  return role.charAt(0).toUpperCase() + role.slice(1);
};

export const lowercaseRole = (role: string): UserRole => {
  if (!role) return 'user';
  const lowercase = role.toLowerCase();
  return lowercase as UserRole;
};

// Convert a string role to proper UserRole type
export const toUserRole = (role: string | undefined): UserRole => {
  if (!role) return 'user';
  
  const normalizedRole = role.toLowerCase();
  
  switch (normalizedRole) {
    case 'admin':
      return 'admin';
    case 'business':
      return 'business';
    case 'influencer':
      return 'influencer';
    case 'staff':
      return 'staff';
    case 'user':
    default:
      return 'user';
  }
};
