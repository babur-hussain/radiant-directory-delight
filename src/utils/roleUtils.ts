
import { UserRole } from '@/types/auth';
import { convertCapitalizedRole, normalizeRole } from '@/types/auth';

/**
 * Checks if a user has admin role
 */
export const isAdmin = (role: string | undefined | null): boolean => {
  if (!role) return false;
  return normalizeRole(role) === 'admin';
};

/**
 * Checks if a user has business role
 */
export const isBusiness = (role: string | undefined | null): boolean => {
  if (!role) return false;
  return normalizeRole(role) === 'business';
};

/**
 * Checks if a user has influencer role
 */
export const isInfluencer = (role: string | undefined | null): boolean => {
  if (!role) return false;
  return normalizeRole(role) === 'influencer';
};

/**
 * Checks if a user has staff role
 */
export const isStaff = (role: string | undefined | null): boolean => {
  if (!role) return false;
  return normalizeRole(role) === 'staff';
};

/**
 * Convert capitalized role formats (Admin, Business) to lowercase (admin, business)
 */
export const convertRoleFormat = (role: string | undefined): UserRole => {
  return convertCapitalizedRole(role);
};

/**
 * Gets a normalized role from any role string format
 */
export const getNormalizedRole = (role: string | undefined): UserRole => {
  return normalizeRole(role);
};
