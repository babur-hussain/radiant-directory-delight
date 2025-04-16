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
    
    // Create an array to store the transformed users
    const influencers: User[] = [];
    
    // Process each user data separately
    if (data && Array.isArray(data)) {
      for (const userData of data) {
        // Transform user data safely
        const influencer = transformUserFromSupabase(userData);
        influencers.push(influencer);
      }
    }
    
    return influencers;
  } catch (error) {
    console.error('Error in getAllInfluencers:', error);
    return [];
  }
};

// Define a simple type for the subscription data
interface SimpleSubscription {
  amount: number;
  created_at: string;
}

// Define the return type for influencer stats
interface InfluencerStats {
  totalReferrals: number;
  totalValue: number;
  earnings: number;
  referralHistory: SimpleSubscription[];
}

/**
 * Get detailed stats for a specific influencer
 * @param userId The influencer's user ID
 * @returns Detailed stats object or null if error
 */
export const getInfluencerStats = async (userId: string): Promise<InfluencerStats | null> => {
  try {
    // Get subscription data related to this influencer
    const { data, error } = await supabase
      .from('user_subscriptions')
      .select('amount, created_at')
      .eq('referrer_id', userId);
      
    if (error) {
      console.error('Error fetching influencer stats:', error);
      return null;
    }
    
    // Initialize an empty array with the correct primitive type
    const referralHistory: SimpleSubscription[] = [];
    
    // Process data safely with primitive values only
    if (data && Array.isArray(data)) {
      for (const item of data) {
        if (item) {
          // Create a new object with primitive values only
          referralHistory.push({
            amount: typeof item.amount === 'number' ? item.amount : 0,
            created_at: typeof item.created_at === 'string' ? item.created_at : ''
          });
        }
      }
    }
    
    // Calculate metrics with our safe primitive values
    const totalReferrals = referralHistory.length;
    const totalValue = referralHistory.reduce((sum, sub) => sum + sub.amount, 0);
    const earnings = totalValue * 0.2; // 20% of total value
    
    // Return a new object with only primitive values or arrays of primitives
    const result: InfluencerStats = {
      totalReferrals,
      totalValue,
      earnings,
      referralHistory
    };
    
    return result;
  } catch (error) {
    console.error('Error in getInfluencerStats:', error);
    return null;
  }
};
