
import { UserRole, ExtendedUserRole, normalizeRole, convertCapitalizedRole } from '@/types/auth';

/**
 * Converts legacy role formats (Admin, Business) to proper UserRole format (admin, business)
 */
export const convertLegacyRole = (role: string | null | undefined): UserRole => {
  if (!role) return 'user';
  return normalizeRole(role);
};

/**
 * Safely compares roles regardless of case or format
 */
export const compareRolesSafely = (role1: string | null | undefined, role2: string | null | undefined): boolean => {
  return normalizeRole(role1) === normalizeRole(role2);
};

/**
 * Checks if a user has admin role (case insensitive)
 */
export const isAdmin = (role: string | null | undefined): boolean => {
  if (!role) return false;
  return normalizeRole(role) === 'admin';
};

/**
 * Checks if a user has business role (case insensitive)
 */
export const isBusiness = (role: string | null | undefined): boolean => {
  if (!role) return false;
  return normalizeRole(role) === 'business';
};

/**
 * Checks if a user has influencer role (case insensitive)
 */
export const isInfluencer = (role: string | null | undefined): boolean => {
  if (!role) return false;
  return normalizeRole(role) === 'influencer';
};

/**
 * Checks if a user has staff role (case insensitive)
 */
export const isStaff = (role: string | null | undefined): boolean => {
  if (!role) return false;
  return normalizeRole(role) === 'staff';
};

/**
 * Checks if a user has user role (case insensitive)
 */
export const isUser = (role: string | null | undefined): boolean => {
  if (!role) return true; // Default is user
  return normalizeRole(role) === 'user';
};

/**
 * Converts role string to normalized format
 * Use this when setting roles to ensure consistency
 */
export const getNormalizedRole = (role: string | null | undefined): UserRole => {
  return normalizeRole(role);
};

/**
 * Safely compares a role against a specific user role
 */
export const roleEquals = (role: string | null | undefined, expectedRole: UserRole): boolean => {
  return normalizeRole(role) === expectedRole;
};

/**
 * Convert legacy capitalized role to proper format
 */
export const convertRoleFormat = (role: string | null | undefined): UserRole => {
  return convertCapitalizedRole(role || '');
};
