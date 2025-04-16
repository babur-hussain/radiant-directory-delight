
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types/auth';
import { transformUserFromSupabase } from '@/lib/supabase/userUtils';

/**
 * Sets or updates the influencer status for a user
 * @param userId The user's ID
 * @param isInfluencer Boolean indicating whether the user is an influencer
 * @returns True if successful, false otherwise
 */
export const setInfluencerStatus = async (userId: string, isInfluencer: boolean): Promise<boolean> => {
  try {
    // Now that we've added the is_influencer column to the users table
    const { error } = await supabase
      .from('users')
      .update({ 
        is_influencer: isInfluencer,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);
    
    if (error) {
      console.error('Error updating influencer status:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in setInfluencerStatus:', error);
    return false;
  }
};

/**
 * Gets all users with the influencer flag set to true
 * @returns Array of influencer users
 */
export const getAllInfluencers = async (): Promise<User[]> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('is_influencer', true)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching influencers:', error);
      return [];
    }
    
    // Create a type-safe mapping approach
    const influencers: User[] = [];
    
    // Process each user data separately to avoid type recursion
    if (data) {
      for (const userData of data) {
        // Use type assertion to unknown first to break the type chain
        const userRecord = userData as unknown;
        // Then safely cast to a simple Record type
        const influencer = transformUserFromSupabase(userRecord as Record<string, any>);
        influencers.push(influencer);
      }
    }
    
    return influencers;
  } catch (error) {
    console.error('Error in getAllInfluencers:', error);
    return [];
  }
};

/**
 * Get detailed stats for a specific influencer
 * @param userId The influencer's user ID
 * @returns Detailed stats object or null if error
 */
export const getInfluencerStats = async (userId: string) => {
  try {
    // First, get the data without assigning typed variables
    const result = await supabase
      .from('user_subscriptions')
      .select('amount, created_at')
      .eq('referrer_id', userId);
    
    if (result.error) {
      console.error('Error fetching influencer stats:', result.error);
      return null;
    }
    
    // Process the data directly as a plain JavaScript array
    const subscriptions = result.data as any[] || [];
    
    // Calculate metrics using the plain array
    const totalReferrals = subscriptions.length;
    const totalValue = subscriptions.reduce((sum, sub) => {
      const amount = typeof sub.amount === 'number' ? sub.amount : 0;
      return sum + amount;
    }, 0);
    const earnings = totalValue * 0.2; // 20% of total value
    
    return {
      totalReferrals,
      totalValue,
      earnings,
      referralHistory: subscriptions
    };
  } catch (error) {
    console.error('Error in getInfluencerStats:', error);
    return null;
  }
};

