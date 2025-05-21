
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { User, UserRole } from '@/types/auth';
import { nanoid } from 'nanoid';

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
      .select('id, referral_count')
      .eq('referral_id', referralCode)
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
        referral_id: referringUser.id 
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
 * Process a referral signup
 * @param userId - The ID of the newly registered user
 * @param referralCode - The referral code from the URL
 */
export const processReferralSignup = async (userId: string, referralCode: string) => {
  try {
    if (!userId || !referralCode) {
      return { success: false, error: "Missing user ID or referral code" };
    }
    
    // Get user role
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();
    
    if (userError || !userData) {
      return { success: false, error: userError };
    }
    
    // Track the referral
    return await trackReferral(referralCode, userId, userData.role);
  } catch (error) {
    console.error("Error processing referral signup:", error);
    return { success: false, error };
  }
};

/**
 * Generate a new referral ID for a user
 * @param userId - The ID of the user
 * @param forceNew - Whether to force generation of a new ID
 */
export const ensureReferralId = async (userId: string, forceNew = false) => {
  try {
    // Check if user already has a referral ID
    if (!forceNew) {
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('referral_id')
        .eq('id', userId)
        .single();
      
      if (!userError && user && user.referral_id) {
        return { success: true, referralId: user.referral_id };
      }
    }
    
    // Generate a new referral ID
    const referralId = nanoid(8);
    
    // Update the user with the new referral ID
    const { error: updateError } = await supabase
      .from('users')
      .update({ referral_id: referralId })
      .eq('id', userId);
    
    if (updateError) {
      return { success: false, error: updateError };
    }
    
    return { success: true, referralId };
  } catch (error) {
    console.error("Error ensuring referral ID:", error);
    return { success: false, error };
  }
};

/**
 * Get a user's referral statistics
 * @param userId - The ID of the user
 */
export const getReferralStats = async (userId: string) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('referral_count, referral_earnings')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error("Error getting referral stats:", error);
      return null;
    }
    
    return {
      referralCount: user?.referral_count || 0,
      referralEarnings: user?.referral_earnings || 0
    };
  } catch (error) {
    console.error("Error getting referral stats:", error);
    return null;
  }
};

/**
 * Get a user by their referral ID
 * @param referralId - The referral ID
 */
export const getUserByReferralId = async (referralId: string) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email')
      .eq('referral_id', referralId)
      .single();
    
    if (error) {
      return { success: false, error };
    }
    
    return { success: true, user: data };
  } catch (error) {
    console.error("Error getting user by referral ID:", error);
    return { success: false, error };
  }
};

/**
 * Record a successful referral
 * @param referralId - The referral ID
 * @param subscriptionAmount - The amount of the subscription
 */
export const recordReferral = async (referralId: string, subscriptionAmount: number) => {
  try {
    // Get the referring user
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, referral_earnings, referral_count')
      .eq('referral_id', referralId)
      .single();
    
    if (userError || !user) {
      return { success: false, error: userError || new Error("User not found") };
    }
    
    // Calculate earnings (20% of subscription amount)
    const earnings = subscriptionAmount * 0.2;
    
    // Update the referring user's earnings
    const { error: updateError } = await supabase
      .from('users')
      .update({
        referral_earnings: (user.referral_earnings || 0) + earnings
      })
      .eq('id', user.id);
    
    if (updateError) {
      return { success: false, error: updateError };
    }
    
    return { success: true };
  } catch (error) {
    console.error("Error recording referral:", error);
    return { success: false, error };
  }
};

/**
 * Mark a referral as successful after certain conditions are met
 * (e.g., user completes profile, makes a purchase, etc.)
 */
export const completeReferral = async (userId: string) => {
  try {
    // Find the user who was referred
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('referral_id')
      .eq('id', userId)
      .single();

    if (userError || !userData || !userData.referral_id) {
      console.log("No referral found for user:", userId);
      return { success: false, error: "No referral found" };
    }

    // Get the referring user
    const { data: referringUser, error: referringError } = await supabase
      .from('users')
      .select('id, referral_count')
      .eq('id', userData.referral_id)
      .single();

    if (referringError) {
      console.error("Error finding referring user:", referringError);
      return { success: false, error: referringError };
    }

    // Increment the referring user's successful referral count if found
    if (referringUser) {
      // Since referral_successful_count doesn't exist in the database schema, 
      // we'll use referral_count instead for now
      const currentCount = referringUser.referral_count || 0;
      
      const { error: incrementError } = await supabase
        .from('users')
        .update({ 
          referral_count: currentCount + 1 
        })
        .eq('id', referringUser.id);

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
