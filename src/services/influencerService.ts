
import { supabase } from '@/integrations/supabase/client';

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

// Mock data for influencers since the actual table doesn't exist
const mockInfluencers = [
  { id: '1', name: 'John Doe', categoryId: 'cat1', locationId: 'loc1' },
  { id: '2', name: 'Jane Smith', categoryId: 'cat2', locationId: 'loc2' },
  { id: '3', name: 'Alex Johnson', categoryId: 'cat1', locationId: 'loc3' },
];

// Mock data for users as influencers
const mockUserInfluencers = [
  { 
    id: '1', 
    name: 'John Doe', 
    email: 'john@example.com', 
    photoURL: null, 
    bio: 'Marketing expert with 5 years of experience',
    referralCount: 15,
    referralEarnings: 15000,
    followersCount: 5000,
    niche: 'Digital Marketing',
    instagramHandle: 'johndoe',
    facebookHandle: 'johndoefb'
  },
  { 
    id: '2', 
    name: 'Jane Smith', 
    email: 'jane@example.com', 
    photoURL: null, 
    bio: 'Content creator and social media specialist',
    referralCount: 25,
    referralEarnings: 22000,
    followersCount: 8500,
    niche: 'Content Creation',
    instagramHandle: 'janesmith',
    facebookHandle: null
  },
  { 
    id: '3', 
    name: 'Alex Johnson', 
    email: 'alex@example.com', 
    photoURL: null, 
    bio: 'SEO expert and business consultant',
    referralCount: 10,
    referralEarnings: 9000,
    followersCount: 3000,
    niche: 'SEO & Analytics',
    instagramHandle: null,
    facebookHandle: 'alexjohnson'
  }
];

export const getInfluencersByCategory = async (categoryId: string) => {
  try {
    // Using mock data instead of supabase query
    return mockInfluencers.filter(inf => inf.categoryId === categoryId);
  } catch (error) {
    console.error('Error fetching influencers by category:', error);
    return [];
  }
};

export const getInfluencersByLocation = async (locationId: string) => {
  try {
    // Using mock data instead of supabase query
    return mockInfluencers.filter(inf => inf.locationId === locationId);
  } catch (error) {
    console.error('Error fetching influencers by location:', error);
    return [];
  }
};

export const getInfluencerById = async (id: string) => {
  try {
    // Using mock data instead of supabase query
    return mockInfluencers.find(inf => inf.id === id) || null;
  } catch (error) {
    console.error('Error fetching influencer by ID:', error);
    return null;
  }
};

export const getInfluencers = async () => {
  try {
    // Using mock data instead of actual database query
    return [...mockInfluencers];
  } catch (error) {
    console.error('Error fetching influencers:', error);
    return [];
  }
};

export const getAllInfluencers = async () => {
  try {
    // Using mock user influencers data
    return [...mockUserInfluencers];
  } catch (error) {
    console.error('Error fetching all influencers:', error);
    return [];
  }
};

export const setInfluencerStatus = async (userId: string, status: boolean): Promise<boolean> => {
  try {
    // In a real implementation, this would update the user's influencer status in the database
    // For now, we'll just return success since it's a mock
    console.log(`Setting influencer status for user ${userId} to ${status}`);
    
    // Simulate a database update delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return true;
  } catch (error) {
    console.error('Error updating influencer status:', error);
    return false;
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
    // Mock data for referrals and subscriptions
    const referrals = [
      { id: 'ref1', influencerId: '1', subscriptionId: 'sub1' },
      { id: 'ref2', influencerId: '1', subscriptionId: 'sub2' },
      { id: 'ref3', influencerId: '2', subscriptionId: 'sub3' },
    ];
    
    // Filter referrals by influencer ID
    const influencerReferrals = referrals.filter(ref => 
      ref.influencerId === influencerId
    );
    
    // Get subscription IDs from referrals
    const subscriptionIds = influencerReferrals.map(ref => ref.subscriptionId);
    
    // Use primitive array to store subscriptions
    const subscriptionsArray: SimpleSubscription[] = [];
    
    // Mock subscriptions data
    const mockSubscriptions = [
      { id: 'sub1', status: 'active', packageId: 'pkg1', createdAt: '2023-01-01' },
      { id: 'sub2', status: 'inactive', packageId: 'pkg2', createdAt: '2023-02-15' },
      { id: 'sub3', status: 'active', packageId: 'pkg1', createdAt: '2023-03-20' },
    ];
    
    // Find matching subscriptions
    for (const id of subscriptionIds) {
      const subscription = mockSubscriptions.find(sub => sub.id === id);
      
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
    stats.totalReferrals = influencerReferrals.length;
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
