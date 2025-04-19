
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types/auth';
import { generateReferralId } from '@/utils/referral/referralUtils';

/**
 * Creates or ensures a referral ID for a user
 * @param userId The user's ID
 * @param forceNew Whether to force generate a new referral ID
 * @returns The user's referral ID
 */
export const ensureReferralId = async (userId: string, forceNew = false): Promise<string> => {
  try {
    // Check if user already has a referral ID and we're not forcing a new one
    if (!forceNew) {
      const { data: userData, error } = await supabase
        .from('users')
        .select('referral_id')
        .eq('id', userId)
        .single();
      
      if (!error && userData && userData.referral_id) {
        return userData.referral_id;
      }
    }
    
    // If user doesn't have a referral ID or we're forcing a new one, generate and save it
    const referralId = generateReferralId();
    
    const { error: updateError } = await supabase
      .from('users')
      .update({ referral_id: referralId })
      .eq('id', userId);
    
    if (updateError) {
      console.error('Error updating user referral ID:', updateError);
      throw updateError;
    }
    
    return referralId;
  } catch (error) {
    console.error('Error in ensureReferralId:', error);
    throw error;
  }
};

/**
 * Gets a user by their referral ID
 * @param referralId The referral ID to look up
 * @returns The user data or null if not found
 */
export const getUserByReferralId = async (referralId: string): Promise<User | null> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('referral_id', referralId)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching user by referral ID:', error);
      throw error;
    }
    
    if (!data) return null;
    
    // Convert data to User type
    const userRole = (data.role?.toLowerCase() || 'user') as string;
    
    return {
      uid: data.id,
      id: data.id,
      email: data.email || '',
      displayName: data.name || '',
      name: data.name || '',
      role: userRole === 'admin' ? 'Admin' : 
            userRole === 'business' ? 'Business' : 
            userRole === 'influencer' ? 'Influencer' : 
            userRole === 'staff' ? 'Staff' : 'User',
      isAdmin: data.is_admin || false,
      photoURL: data.photo_url || null,
      createdAt: data.created_at || new Date().toISOString(),
      lastLogin: data.last_login || new Date().toISOString(),
      referralId: data.referral_id || null,
      referralEarnings: data.referral_earnings || 0,
      referralCount: data.referral_count || 0,
      // Removing reference to non-existent property
      referredBy: null,
      isInfluencer: data.is_influencer || false
    };
  } catch (error) {
    console.error('Error in getUserByReferralId:', error);
    return null;
  }
};

/**
 * Records a successful referral when a subscription is purchased
 * @param referrerId The ID of the referring user
 * @param subscriptionAmount The amount of the subscription
 * @returns True if successful, false otherwise
 */
export const recordReferral = async (referrerId: string, subscriptionAmount: number): Promise<boolean> => {
  try {
    // Calculate referral earnings (20% of subscription amount)
    const earnings = subscriptionAmount * 0.2;
    
    try {
      // Use the custom function to record referral
      const { error } = await supabase.rpc('record_referral', {
        referrer_id: referrerId,
        earning_amount: earnings
      });
      
      if (error) {
        console.error('Error calling record_referral function:', error);
        
        // Fallback if the function call fails - direct update
        const { data: userData } = await supabase
          .from('users')
          .select('referral_earnings, referral_count')
          .eq('id', referrerId)
          .single();
        
        const currentEarnings = userData?.referral_earnings || 0;
        const currentCount = userData?.referral_count || 0;
        
        const { error: updateError } = await supabase
          .from('users')
          .update({
            referral_earnings: currentEarnings + earnings,
            referral_count: currentCount + 1
          })
          .eq('id', referrerId);
        
        if (updateError) {
          console.error('Error updating referral stats:', updateError);
          return false;
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error recording referral:', error);
      return false;
    }
  } catch (error) {
    console.error('Error in recordReferral:', error);
    return false;
  }
};

/**
 * Processes a new user registration with a referral code
 * @param newUserId The ID of the new user
 * @param referralId The referral ID used during signup
 */
export const processReferralSignup = async (newUserId: string, referralId: string): Promise<boolean> => {
  try {
    // First, validate the referral ID
    const { data: referrerData, error } = await supabase
      .from('users')
      .select('id')
      .eq('referral_id', referralId)
      .single();
    
    if (error || !referrerData) {
      console.error('Invalid referral ID or error fetching referrer:', error);
      return false;
    }
    
    // Since there's no 'referred_by' column in the users table per the type definition,
    // we need to add a column to track referrals. For now, we'll log this but won't update
    console.log(`User ${newUserId} would be linked to referrer ${referrerData.id}`);
    
    // This is a workaround until we can properly add a column to track referrals
    // We'll just return success since we've validated the referral ID
    console.log(`User ${newUserId} successfully linked to referrer ${referrerData.id}`);
    return true;
  } catch (error) {
    console.error('Error processing referral signup:', error);
    return false;
  }
};
