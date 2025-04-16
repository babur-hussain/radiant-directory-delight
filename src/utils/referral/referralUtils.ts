
import { nanoid } from 'nanoid';

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
  return `${baseUrl}/signup?ref=${referralId}`;
}
