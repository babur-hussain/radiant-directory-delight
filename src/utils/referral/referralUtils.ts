
/**
 * Get the referral ID from the URL query parameters
 * @returns The referral ID or null if not found
 */
export const getReferralIdFromURL = (): string | null => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('ref');
};

/**
 * Validate a referral ID by checking if it exists in the database
 * @param referralId - The referral ID to validate
 * @returns True if valid, false if invalid
 */
export const validateReferralId = async (referralId: string): Promise<boolean> => {
  // This is a placeholder implementation
  // In a real implementation, you would make an API call to validate the referral ID
  if (!referralId) return false;
  
  try {
    // For now, we'll consider any non-empty referral ID as valid
    // In a real implementation, you would make an API call to check
    return true;
  } catch (error) {
    console.error('Error validating referral ID:', error);
    return false;
  }
};

/**
 * Generate a referral link for a user
 * @param referralId - The user's referral ID
 * @returns The full referral link
 */
export const generateReferralLink = (referralId: string): string => {
  const baseUrl = window.location.origin;
  return `${baseUrl}/register?ref=${referralId}`;
};
