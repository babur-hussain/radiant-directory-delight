
import { supabase } from '@/integrations/supabase/client';
import { SubscriptionPackage } from '@/models/SubscriptionPackage';
import { getBusinesses } from './businessService';

// Simple types to avoid excessive type instantiation
interface SimpleSubscription {
  id: string;
  status: string;
  packageId: string;
  createdAt: string;
}

interface InfluencerStats {
  totalLeads: number;
  totalReferrals: number;
  totalEarnings: number;
  subscriptions: SimpleSubscription[];
}

export const getInfluencersByCategory = async (categoryId: string) => {
  try {
    const { data, error } = await supabase
      .from('influencers')
      .select('*')
      .eq('categoryId', categoryId);

    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error fetching influencers by category:', error);
    return [];
  }
};

export const getInfluencersByLocation = async (locationId: string) => {
  try {
    const { data, error } = await supabase
      .from('influencers')
      .select('*')
      .eq('locationId', locationId);

    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error fetching influencers by location:', error);
    return [];
  }
};

export const getInfluencerById = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from('influencers')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error fetching influencer by ID:', error);
    return null;
  }
};

export const getInfluencers = async () => {
  try {
    const { data, error } = await supabase
      .from('influencers')
      .select('*');

    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error fetching influencers:', error);
    return [];
  }
};

export const getInfluencerStats = async (influencerId: string): Promise<InfluencerStats> => {
  // Create a default stats object
  const stats: InfluencerStats = {
    totalLeads: 0,
    totalReferrals: 0,
    totalEarnings: 0,
    subscriptions: []
  };

  try {
    // Get referrals by influencer
    const { data: referrals, error: referralsError } = await supabase
      .from('referrals')
      .select('*')
      .eq('influencerId', influencerId);

    if (referralsError) throw referralsError;
    
    // Get subscriptions from referrals
    const subscriptionIds = referrals?.map(ref => ref.subscriptionId) || [];
    
    // Use primitive array to store subscriptions
    const subscriptionsArray: SimpleSubscription[] = [];
    
    // Iterate through subscription IDs with a for loop to avoid deep type instantiation
    for (let i = 0; i < subscriptionIds.length; i++) {
      const id = subscriptionIds[i];
      if (!id) continue;
      
      const { data: subscription, error: subscriptionError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('id', id)
        .single();
      
      if (subscriptionError) {
        console.error('Error fetching subscription:', subscriptionError);
        continue;
      }
      
      if (subscription) {
        // Create a simple object with primitive types
        subscriptionsArray.push({
          id: String(subscription.id || ''),
          status: String(subscription.status || ''),
          packageId: String(subscription.packageId || ''),
          createdAt: String(subscription.createdAt || '')
        });
      }
    }
    
    // Calculate totals
    stats.totalReferrals = referrals?.length || 0;
    stats.subscriptions = subscriptionsArray;
    
    // Calculate leads and earnings
    let earnings = 0;
    for (let i = 0; i < subscriptionsArray.length; i++) {
      const subscription = subscriptionsArray[i];
      if (subscription.status === 'active') {
        earnings += 100; // Example commission amount
      }
    }
    stats.totalEarnings = earnings;
    stats.totalLeads = stats.totalReferrals * 2; // Example calculation
    
    return stats;
  } catch (error) {
    console.error('Error fetching influencer stats:', error);
    return stats;
  }
};
