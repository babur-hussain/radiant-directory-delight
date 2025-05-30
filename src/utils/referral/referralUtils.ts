
import { getUserByReferralId } from '@/services/referralService';

/**
 * Get referral ID from URL parameters
 */
export const getReferralIdFromURL = (): string | null => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('ref') || urlParams.get('referral') || urlParams.get('referralCode');
};

/**
 * Validate if a referral ID exists and is valid
 */
export const validateReferralId = async (referralId: string): Promise<boolean> => {
  if (!referralId || referralId.trim() === '') {
    return false;
  }
  
  try {
    const result = await getUserByReferralId(referralId);
    return result.success && result.user;
  } catch (error) {
    console.error('Error validating referral ID:', error);
    return false;
  }
};

/**
 * Generate referral URL for a user
 */
export const generateReferralURL = (referralId: string, baseUrl?: string): string => {
  const base = baseUrl || window.location.origin;
  return `${base}/auth?ref=${referralId}&tab=register`;
};

/**
 * Extract referral data from URL and store it temporarily
 */
export const processReferralFromURL = () => {
  const referralId = getReferralIdFromURL();
  
  if (referralId) {
    // Store in sessionStorage to persist during registration flow
    sessionStorage.setItem('referralCode', referralId);
    return referralId;
  }
  
  // Check if we have a stored referral code
  return sessionStorage.getItem('referralCode');
};

/**
 * Clear stored referral data
 */
export const clearStoredReferralData = () => {
  sessionStorage.removeItem('referralCode');
};
