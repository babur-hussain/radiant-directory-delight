
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

// Define a simple interface for subscription records to avoid deep type inference
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
    // Use a simple query without complex type inference
    const { data: rawData, error } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('referrer_id', userId);
      
    if (error) {
      console.error('Error fetching influencer stats:', error);
      return null;
    }
    
    // Manually process the subscription data with explicit typing
    const subscriptions: SubscriptionData[] = [];
    
    if (rawData && Array.isArray(rawData)) {
      for (const item of rawData) {
        // Safely extract the fields we need with proper type checking
        const amount = typeof item?.amount === 'number' ? item.amount : 0;
        const created_at = typeof item?.created_at === 'string' ? item.created_at : '';
        
        subscriptions.push({
          amount,
          created_at
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
