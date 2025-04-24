
import { supabase } from '@/integrations/supabase/client';

/**
 * Validates a password reset token from the URL
 * @param token The password reset token
 * @returns Boolean indicating if the token is valid
 */
export const validatePasswordResetToken = async (token: string): Promise<boolean> => {
  try {
    // Check if the token exists and is properly formatted
    if (!token) {
      return false;
    }

    // Supabase handles token validation internally when using the updateUser method
    // This function is for additional checks if needed
    return true;
  } catch (error) {
    console.error('Error validating password reset token:', error);
    return false;
  }
};

/**
 * Extracts token parameters from the URL search string
 * @param search URL search string
 * @returns Object containing the token and other parameters
 */
export const extractTokenFromURL = (search: string): { token: string | null; type: string | null } => {
  const params = new URLSearchParams(search);
  return {
    token: params.get('token'),
    type: params.get('type')
  };
};

/**
 * Generates the password reset redirect URL
 * @returns Full URL for password reset redirect
 */
export const getPasswordResetRedirectURL = (): string => {
  return `${window.location.origin}/auth/reset-password`;
};

/**
 * Determines if the current page is loaded as part of a password reset flow
 * @param search URL search string
 * @returns Boolean indicating if this is a password reset flow
 */
export const isPasswordResetFlow = (search: string): boolean => {
  const params = new URLSearchParams(search);
  return params.has('type') && params.get('type') === 'recovery' && params.has('token');
};
