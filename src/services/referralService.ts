
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types/auth';
import { generateReferralId } from '@/utils/referral/referralUtils';
import { toast } from '@/hooks/use-toast';

/**
 * Creates or ensures a referral ID for a user
 * @param userId The user's ID
 * @param forceNew Whether to force generate a new referral ID
 * @returns The user's referral ID
 */
export const ensureReferralId = async (userId: string, forceNew = false): Promise<string> => {
  try {
    console.log(`Ensuring referral ID for user ${userId}, forceNew: ${forceNew}`);
    
    // Check if user already has a referral ID and we're not forcing a new one
    if (!forceNew) {
      const { data: userData, error } = await supabase
        .from('users')
        .select('referral_id')
        .eq('id', userId)
        .single();
      
      if (!error && userData && userData.referral_id) {
        console.log(`User already has referral ID: ${userData.referral_id}`);
        return userData.referral_id;
      }
    }
    
    // If user doesn't have a referral ID or we're forcing a new one, generate and save it
    const referralId = generateReferralId();
    console.log(`Generated new referral ID: ${referralId}`);
    
    const { error: updateError } = await supabase
      .from('users')
      .update({ referral_id: referralId })
      .eq('id', userId);
    
    if (updateError) {
      console.error('Error updating user referral ID:', updateError);
      throw updateError;
    }
    
    console.log(`Successfully saved new referral ID for user ${userId}`);
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
    console.log(`Looking up user by referral ID: ${referralId}`);
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('referral_id', referralId)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching user by referral ID:', error);
      throw error;
    }
    
    if (!data) {
      console.log(`No user found with referral ID: ${referralId}`);
      return null;
    }
    
    console.log(`Found user with referral ID: ${referralId}`, data.id);
    
    // Convert data to User type
    const userRole = (data.role?.toLowerCase() || 'user') as string;
    
    return {
      uid: data.id,
      id: data.id, // Ensure id is set to match uid
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
      referredBy: null, // This is set separately as it may not exist in the schema
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
    console.log(`Recording referral from user ${referrerId} for amount ${subscriptionAmount}`);
    
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
        console.log('Falling back to direct update method');
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
      
      console.log(`Successfully recorded referral for user ${referrerId}`);
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
 * Updates the referring user field for a user and increments the referrer's count
 * @param newUserId The ID of the new user
 * @param referralId The referral ID used during signup
 * @returns True if successful, false otherwise
 */
export const processReferralSignup = async (newUserId: string, referralId: string): Promise<boolean> => {
  try {
    console.log(`Processing referral signup for new user ${newUserId} with referral ID ${referralId}`);
    
    // First, validate the referral ID and get the referrer
    const { data: referrerData, error } = await supabase
      .from('users')
      .select('id')
      .eq('referral_id', referralId)
      .single();
    
    if (error || !referrerData) {
      console.error('Invalid referral ID or error fetching referrer:', error);
      return false;
    }
    
    console.log(`Found referrer with ID ${referrerData.id}`);
    
    // Update the new user with the referrer's ID
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        // Use fields that exist in the schema
        referring_user_id: referrerData.id 
      })
      .eq('id', newUserId);
    
    if (updateError) {
      console.error('Error updating referring_user_id for new user:', updateError);
      return false;
    }
    
    console.log(`Updated referring_user_id field for user ${newUserId}`);
    
    // Increment the referrer's count using the custom function
    const { error: recordError } = await supabase.rpc('record_referral', {
      referrer_id: referrerData.id,
      earning_amount: 0 // No earnings yet, just increment count
    });
    
    if (recordError) {
      console.error('Error incrementing referrer count:', recordError);
      
      // Fallback - direct update
      console.log('Falling back to direct update method for referral count');
      const { data: userData } = await supabase
        .from('users')
        .select('referral_count')
        .eq('id', referrerData.id)
        .single();
      
      const currentCount = userData?.referral_count || 0;
      
      const { error: updateCountError } = await supabase
        .from('users')
        .update({
          referral_count: currentCount + 1
        })
        .eq('id', referrerData.id);
      
      if (updateCountError) {
        console.error('Error updating referral count:', updateCountError);
        return false;
      }
    }
    
    console.log(`Successfully processed referral signup for user ${newUserId}`);
    return true;
  } catch (error) {
    console.error('Error processing referral signup:', error);
    return false;
  }
};

/**
 * Check if a referral ID exists from the URL and process it during signup
 * @param userId The newly created user's ID
 * @returns True if successful or no referral to process, false if processing failed
 */
export const checkAndProcessReferralFromURL = async (userId: string): Promise<boolean> => {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const referralId = urlParams.get('ref');
    
    if (!referralId) {
      console.log('No referral ID found in URL');
      return true; // No referral to process is not a failure
    }
    
    console.log(`Found referral ID in URL: ${referralId}, processing for user ${userId}`);
    return await processReferralSignup(userId, referralId);
  } catch (error) {
    console.error('Error in checkAndProcessReferralFromURL:', error);
    return false;
  }
};

/**
 * Get referral statistics for a user
 * @param userId The user's ID
 * @returns Referral statistics or null if not found
 */
export const getReferralStats = async (userId: string): Promise<{
  referralId: string | null;
  referralCount: number;
  referralEarnings: number;
} | null> => {
  try {
    console.log(`Getting referral stats for user ${userId}`);
    
    const { data, error } = await supabase
      .from('users')
      .select('referral_id, referral_count, referral_earnings')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Error fetching referral stats:', error);
      return null;
    }
    
    console.log(`Got referral stats for user ${userId}:`, data);
    
    return {
      referralId: data.referral_id,
      referralCount: data.referral_count || 0,
      referralEarnings: data.referral_earnings || 0
    };
  } catch (error) {
    console.error('Error in getReferralStats:', error);
    return null;
  }
};

/**
 * Updates the referral stats in the UI context after changes
 * @param userId The user's ID
 * @param authContextUpdater Function to update the auth context
 */
export const refreshReferralData = async (userId: string, authContextUpdater: (userData: any) => void): Promise<void> => {
  try {
    console.log(`Refreshing referral data for user ${userId}`);
    
    const stats = await getReferralStats(userId);
    
    if (stats) {
      authContextUpdater({
        referralId: stats.referralId,
        referralCount: stats.referralCount,
        referralEarnings: stats.referralEarnings
      });
    }
  } catch (error) {
    console.error('Error refreshing referral data:', error);
    toast({
      title: "Refresh Failed",
      description: "Could not refresh referral data",
      variant: "destructive",
    });
  }
};

/**
 * Validates if a referral ID is valid
 * @param referralId The referral ID to validate
 * @returns True if valid, false otherwise
 */
export const validateReferralId = async (referralId: string): Promise<boolean> => {
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
};
