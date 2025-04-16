
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

// Define a simple interface for subscription data
interface SubscriptionData {
  amount: number;
  created_at: string;
}

/**
 * Get detailed stats for a specific influencer
 * @param userId The influencer's user ID
 * @returns Detailed stats object or null if error
 */
export const getInfluencerStats = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('user_subscriptions')
      .select('amount, created_at')
      .eq('referrer_id', userId);
      
    if (error) {
      console.error('Error fetching influencer stats:', error);
      return null;
    }
    
    // Process the subscription data safely
    const subscriptions: SubscriptionData[] = [];
    
    if (data && Array.isArray(data)) {
      for (const item of data) {
        subscriptions.push({
          amount: typeof item.amount === 'number' ? item.amount : 0,
          created_at: typeof item.created_at === 'string' ? item.created_at : ''
        });
      }
    }
    
    // Calculate metrics
    const totalReferrals = subscriptions.length;
    const totalValue = subscriptions.reduce((sum, sub) => sum + sub.amount, 0);
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
