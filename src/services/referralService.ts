
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

/**
 * Track a referral when a user registers through a referral link
 * @param referralCode - The referral code from the URL
 * @param newUserId - The ID of the newly registered user
 * @param userRole - The role of the new user
 */
export const trackReferral = async (
  referralCode: string,
  newUserId: string,
  userRole: string
) => {
  try {
    if (!referralCode || !newUserId) {
      console.warn("Missing referral code or user ID for tracking referral");
      return { success: false, error: "Missing referral data" };
    }

    // First, find the referring user by their referral code
    const { data: referringUsers, error: findError } = await supabase
      .from('users')
      .select('id, referral_count, referral_successful_count')
      .eq('referral_code', referralCode)
      .limit(1);

    if (findError) {
      console.error("Error finding referring user:", findError);
      return { success: false, error: findError };
    }

    if (!referringUsers || referringUsers.length === 0) {
      console.error("No referring user found with code:", referralCode);
      return { success: false, error: "Invalid referral code" };
    }

    const referringUser = referringUsers[0];
    
    // Update the new user to associate them with the referring user
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        referred_by: referringUser.id,
        referral_status: 'pending' 
      })
      .eq('id', newUserId);

    if (updateError) {
      console.error("Error updating referred user:", updateError);
      return { success: false, error: updateError };
    }

    // Increment the referring user's referral count
    const { error: incrementError } = await supabase
      .from('users')
      .update({ 
        referral_count: (referringUser.referral_count || 0) + 1 
      })
      .eq('id', referringUser.id);

    if (incrementError) {
      console.error("Error incrementing referral count:", incrementError);
      return { success: false, error: incrementError };
    }

    // Create a referral record
    const { error: referralError } = await supabase
      .from('referrals')
      .insert([
        { 
          referring_user_id: referringUser.id,
          referred_user_id: newUserId,
          status: 'pending',
          user_role: userRole
        }
      ]);

    if (referralError) {
      console.error("Error creating referral record:", referralError);
      return { success: false, error: referralError };
    }

    return { 
      success: true, 
      message: "Referral tracked successfully" 
    };
  } catch (error) {
    console.error("Error tracking referral:", error);
    return { success: false, error };
  }
};

/**
 * Mark a referral as successful after certain conditions are met
 * (e.g., user completes profile, makes a purchase, etc.)
 */
export const completeReferral = async (userId: string) => {
  try {
    // Find the user's referral record
    const { data: referrals, error: findError } = await supabase
      .from('referrals')
      .select('id, referring_user_id, status')
      .eq('referred_user_id', userId)
      .eq('status', 'pending')
      .limit(1);

    if (findError) {
      console.error("Error finding referral:", findError);
      return { success: false, error: findError };
    }

    if (!referrals || referrals.length === 0) {
      console.log("No pending referral found for user:", userId);
      return { success: false, error: "No pending referral found" };
    }

    const referral = referrals[0];

    // Update the referral status to 'completed'
    const { error: updateReferralError } = await supabase
      .from('referrals')
      .update({ status: 'completed' })
      .eq('id', referral.id);

    if (updateReferralError) {
      console.error("Error updating referral status:", updateReferralError);
      return { success: false, error: updateReferralError };
    }

    // Update user's referral status
    const { error: updateUserError } = await supabase
      .from('users')
      .update({ referral_status: 'completed' })
      .eq('id', userId);

    if (updateUserError) {
      console.error("Error updating user referral status:", updateUserError);
      return { success: false, error: updateUserError };
    }

    // Increment the referring user's successful referral count
    const { data: referringUsers, error: findReferringError } = await supabase
      .from('users')
      .select('referral_successful_count')
      .eq('id', referral.referring_user_id)
      .limit(1);

    if (findReferringError) {
      console.error("Error finding referring user:", findReferringError);
      return { success: false, error: findReferringError };
    }

    if (referringUsers && referringUsers.length > 0) {
      const currentCount = referringUsers[0].referral_successful_count || 0;
      
      const { error: incrementError } = await supabase
        .from('users')
        .update({ 
          referral_successful_count: currentCount + 1 
        })
        .eq('id', referral.referring_user_id);

      if (incrementError) {
        console.error("Error incrementing successful referral count:", incrementError);
        return { success: false, error: incrementError };
      }
    }

    return {
      success: true,
      message: "Referral marked as completed successfully"
    };
  } catch (error) {
    console.error("Error completing referral:", error);
    return { success: false, error };
  }
};
