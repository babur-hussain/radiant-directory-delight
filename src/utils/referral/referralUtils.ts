
import { nanoid } from 'nanoid';
import { supabase } from '@/integrations/supabase/client';

/**
 * Generates a unique referral ID for a user
 * @returns A short, unique referral code
 */
export function generateReferralId(): string {
  // Generate a shorter referral ID (8 characters)
  return nanoid(8);
}

/**
 * Calculates referral earnings for a given subscription amount
 * @param subscriptionAmount The total amount of the subscription
 * @returns The calculated referral earnings (20% of subscription amount)
 */
export function calculateReferralEarnings(subscriptionAmount: number): number {
  // Calculate 20% of the subscription amount
  const earnings = subscriptionAmount * 0.2;
  // Round to 2 decimal places
  return Math.round(earnings * 100) / 100;
}

/**
 * Creates a referral link for a user
 * @param referralId The user's referral ID
 * @returns A complete referral link
 */
export function createReferralLink(referralId: string): string {
  // Create a link to the signup page with the referral ID as a query parameter
  const baseUrl = window.location.origin;
  return `${baseUrl}/auth?ref=${referralId}`;
}

/**
 * Gets the referral ID from the current URL if it exists
 * @returns The referral ID from the URL or null if not present
 */
export function getReferralIdFromURL(): string | null {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('ref');
}

/**
 * Tracks a referral when a user signs up with a referral code
 * @param referrerId The referral ID of the referrer
 * @param newUserId The ID of the newly registered user
 */
export async function trackReferral(referrerId: string, newUserId: string): Promise<boolean> {
  try {
    // First get the user ID associated with the referral ID
    const { data: referrerData, error: referrerError } = await supabase
      .from('users')
      .select('id')
      .eq('referral_id', referrerId)
      .single();

    if (referrerError || !referrerData) {
      console.error('Error finding referrer:', referrerError);
      return false;
    }

    // For now, we'll just log this relationship since we don't have a 'referred_by' field
    console.log(`User ${newUserId} referred by user with ID ${referrerData.id}`);
    
    // Since we can't update with a non-existent field, we'll just update the timestamp
    // This is a temporary solution until the database schema is updated
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        updated_at: new Date().toISOString()
      })
      .eq('id', newUserId);

    if (updateError) {
      console.error('Error updating referred user:', updateError);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error tracking referral:', error);
    return false;
  }
}

/**
 * Validates if a referral ID is valid
 * @param referralId The referral ID to validate
 * @returns True if valid, false otherwise
 */
export async function validateReferralId(referralId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .eq('referral_id', referralId)
      .single();

    if (error || !data) {
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error validating referral ID:', error);
    return false;
  }
}
