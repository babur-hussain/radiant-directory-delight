
import { UserRole, normalizeRole } from '@/types/auth';

// Helper function to compare roles safely
export const isSameRole = (roleA: string | undefined, roleB: string | undefined): boolean => {
  if (!roleA || !roleB) return false;
  return roleA.toLowerCase() === roleB.toLowerCase();
};

// Check if a role is one of the valid roles
export const isValidRole = (role: string | undefined): boolean => {
  if (!role) return false;
  const normalized = role.toLowerCase();
  return ['admin', 'user', 'business', 'influencer', 'staff'].includes(normalized);
};

// Convert capitalized role formats to UserRole type
export const capitalizeRole = (role: UserRole): string => {
  if (!role) return '';
  return role.charAt(0).toUpperCase() + role.slice(1);
};

// Convert role string to UserRole type safely
export const toUserRole = (role: string | undefined): UserRole => {
  return normalizeRole(role);
};

// Utility function to check role types
export const isAdmin = (role: string | undefined): boolean => {
  return isSameRole(role, 'admin');
};

export const isBusiness = (role: string | undefined): boolean => {
  return isSameRole(role, 'business');
};

export const isInfluencer = (role: string | undefined): boolean => {
  return isSameRole(role, 'influencer');
};

export const isUser = (role: string | undefined): boolean => {
  return isSameRole(role, 'user');
};

export const isStaff = (role: string | undefined): boolean => {
  return isSameRole(role, 'staff');
};
