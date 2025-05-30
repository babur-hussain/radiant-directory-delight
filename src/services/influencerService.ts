import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types/auth';

// Real influencers data based on the provided information
const realInfluencersData = [
  // Entertainment & Comedy
  {
    id: '1',
    name: 'Bhuvan Bam',
    email: 'contact@bhuvan.bam22',
    niche: 'Comedy, Music',
    location: 'Delhi',
    followers_count: 22200000,
    engagement_rate: 8.5,
    rating: 4.9,
    featured: true,
    priority: 10,
    instagram_handle: 'bhuvan.bam22',
    youtube_handle: 'BB Ki Vines',
    profile_image: 'https://ui-avatars.com/api/?name=Bhuvan+Bam&size=400&background=7c3aed&color=fff',
    cover_image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&h=400&fit=crop',
    bio: 'Comedian, musician, and content creator. Creator of BB Ki Vines.',
    tags: ['Comedy', 'Music', 'YouTube', 'Viral Content'],
    previous_brands: ['Netflix', 'Amazon Prime', 'Disney+ Hotstar'],
    reviews: 485,
    category: 'Entertainment & Comedy'
  },
  {
    id: '2',
    name: 'CarryMinati',
    email: 'contact@carryminati',
    niche: 'Comedy, Gaming',
    location: 'Faridabad, Haryana',
    followers_count: 22100000,
    engagement_rate: 9.2,
    rating: 4.8,
    featured: true,
    priority: 9,
    instagram_handle: 'carryminati',
    youtube_handle: 'CarryMinati',
    profile_image: 'https://ui-avatars.com/api/?name=CarryMinati&size=400&background=ef4444&color=fff',
    cover_image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&h=400&fit=crop',
    bio: 'Gaming content creator and roast king of India.',
    tags: ['Gaming', 'Comedy', 'Roasting', 'YouTube'],
    previous_brands: ['OnePlus', 'Garena Free Fire', 'PUBG Mobile'],
    reviews: 523,
    category: 'Entertainment & Comedy'
  },
  {
    id: '3',
    name: 'Ashish Chanchlani',
    email: 'contact@ashishchanchlani',
    niche: 'Comedy',
    location: 'Mumbai',
    followers_count: 17300000,
    engagement_rate: 7.8,
    rating: 4.7,
    featured: true,
    priority: 8,
    instagram_handle: 'ashishchanchlani',
    youtube_handle: 'Ashish Chanchlani Vines',
    profile_image: 'https://ui-avatars.com/api/?name=Ashish+Chanchlani&size=400&background=10b981&color=fff',
    cover_image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=400&fit=crop',
    bio: 'Comedy content creator known for relatable vines and sketches.',
    tags: ['Comedy', 'Vines', 'Entertainment'],
    previous_brands: ['Myntra', 'Paytm', 'Flipkart'],
    reviews: 412,
    category: 'Entertainment & Comedy'
  },
  {
    id: '4',
    name: 'Kusha Kapila',
    email: 'contact@kushakapila',
    niche: 'Comedy, Fashion',
    location: 'Delhi',
    followers_count: 4300000,
    engagement_rate: 6.5,
    rating: 4.6,
    featured: false,
    priority: 7,
    instagram_handle: 'kushakapila',
    profile_image: 'https://ui-avatars.com/api/?name=Kusha+Kapila&size=400&background=ec4899&color=fff',
    cover_image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&h=400&fit=crop',
    bio: 'Fashion and comedy content creator, digital influencer.',
    tags: ['Comedy', 'Fashion', 'Lifestyle'],
    previous_brands: ['Nykaa', 'H&M', 'Zara'],
    reviews: 289,
    category: 'Entertainment & Comedy'
  },
  {
    id: '5',
    name: 'Dolly Singh',
    email: 'contact@dollysingh',
    niche: 'Comedy, Fashion',
    location: 'Delhi',
    followers_count: 1600000,
    engagement_rate: 5.8,
    rating: 4.5,
    featured: false,
    priority: 6,
    instagram_handle: 'dollysingh',
    profile_image: 'https://ui-avatars.com/api/?name=Dolly+Singh&size=400&background=8b5cf6&color=fff',
    cover_image: 'https://images.unsplash.com/photo-1494790108755-2616c5a78d96?w=800&h=400&fit=crop',
    bio: 'Comedy and fashion content creator.',
    tags: ['Comedy', 'Fashion', 'Content Creation'],
    previous_brands: ['Myntra', 'Lakme', 'Forever 21'],
    reviews: 156,
    category: 'Entertainment & Comedy'
  },

  // Fashion & Lifestyle
  {
    id: '6',
    name: 'Komal Pandey',
    email: 'contact@komalpandeyofficial',
    niche: 'Fashion',
    location: 'Delhi',
    followers_count: 1900000,
    engagement_rate: 7.2,
    rating: 4.7,
    featured: true,
    priority: 8,
    instagram_handle: 'komalpandeyofficial',
    profile_image: 'https://ui-avatars.com/api/?name=Komal+Pandey&size=400&background=f59e0b&color=fff',
    cover_image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&h=400&fit=crop',
    bio: 'Fashion stylist and content creator.',
    tags: ['Fashion', 'Styling', 'Lifestyle'],
    previous_brands: ['Nykaa Fashion', 'Myntra', 'AJIO'],
    reviews: 234,
    category: 'Fashion & Lifestyle'
  },
  {
    id: '7',
    name: 'Masoom Minawala',
    email: 'contact@masoomminawala',
    niche: 'Fashion, Luxury',
    location: 'Mumbai',
    followers_count: 1400000,
    engagement_rate: 6.8,
    rating: 4.6,
    featured: false,
    priority: 7,
    instagram_handle: 'masoomminawala',
    profile_image: 'https://ui-avatars.com/api/?name=Masoom+Minawala&size=400&background=06b6d4&color=fff',
    cover_image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800&h=400&fit=crop',
    bio: 'Luxury fashion and lifestyle influencer.',
    tags: ['Fashion', 'Luxury', 'Lifestyle'],
    previous_brands: ['Gucci', 'Louis Vuitton', 'Chanel'],
    reviews: 189,
    category: 'Fashion & Lifestyle'
  },

  // Gaming & Tech
  {
    id: '8',
    name: 'Dynamo Gaming',
    email: 'contact@aadityadynamo',
    niche: 'Gaming',
    location: 'Mumbai',
    followers_count: 2200000,
    engagement_rate: 8.9,
    rating: 4.8,
    featured: true,
    priority: 8,
    instagram_handle: 'aadityadynamo',
    youtube_handle: 'Dynamo Gaming',
    profile_image: 'https://ui-avatars.com/api/?name=Dynamo+Gaming&size=400&background=3b82f6&color=fff',
    cover_image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&h=400&fit=crop',
    bio: 'Professional gamer and esports influencer.',
    tags: ['Gaming', 'Esports', 'PUBG Mobile'],
    previous_brands: ['PUBG Mobile', 'OnePlus', 'Red Bull'],
    reviews: 312,
    category: 'Gaming & Tech'
  },
  {
    id: '9',
    name: 'Mortal',
    email: 'contact@ig_mortal',
    niche: 'Gaming',
    location: 'Mumbai',
    followers_count: 2500000,
    engagement_rate: 9.1,
    rating: 4.9,
    featured: true,
    priority: 9,
    instagram_handle: 'ig_mortal',
    youtube_handle: 'Mortal',
    profile_image: 'https://ui-avatars.com/api/?name=Mortal&size=400&background=dc2626&color=fff',
    cover_image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&h=400&fit=crop',
    bio: 'Gaming content creator and streamer.',
    tags: ['Gaming', 'Streaming', 'PUBG Mobile'],
    previous_brands: ['PUBG Mobile', 'Asus ROG', 'HyperX'],
    reviews: 398,
    category: 'Gaming & Tech'
  },

  // Fitness & Health
  {
    id: '10',
    name: 'Ranveer Allahbadia',
    email: 'contact@beerbiceps',
    niche: 'Fitness, Lifestyle',
    location: 'Mumbai',
    followers_count: 3400000,
    engagement_rate: 7.5,
    rating: 4.8,
    featured: true,
    priority: 8,
    instagram_handle: 'beerbiceps',
    youtube_handle: 'BeerBiceps',
    profile_image: 'https://ui-avatars.com/api/?name=Ranveer+Allahbadia&size=400&background=059669&color=fff',
    cover_image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=400&fit=crop',
    bio: 'Fitness enthusiast, entrepreneur, and podcast host.',
    tags: ['Fitness', 'Entrepreneurship', 'Motivation'],
    previous_brands: ['MuscleBlaze', 'Nike', 'Under Armour'],
    reviews: 445,
    category: 'Fitness & Health'
  },

  // Music & Dance
  {
    id: '11',
    name: 'Neha Kakkar',
    email: 'contact@nehakakkar',
    niche: 'Music',
    location: 'Mumbai',
    followers_count: 14800000,
    engagement_rate: 8.7,
    rating: 4.9,
    featured: true,
    priority: 10,
    instagram_handle: 'nehakakkar',
    profile_image: 'https://ui-avatars.com/api/?name=Neha+Kakkar&size=400&background=f97316&color=fff',
    cover_image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=400&fit=crop',
    bio: 'Playback singer and music composer.',
    tags: ['Music', 'Singing', 'Bollywood'],
    previous_brands: ['T-Series', 'Zee Music', 'Sony Music'],
    reviews: 567,
    category: 'Music & Dance'
  },
  {
    id: '12',
    name: 'Riyaz Aly',
    email: 'contact@riyaz.14',
    niche: 'Dance, Lip-sync',
    location: 'Jaipur',
    followers_count: 27600000,
    engagement_rate: 9.5,
    rating: 4.8,
    featured: true,
    priority: 10,
    instagram_handle: 'riyaz.14',
    tiktok_handle: 'riyaz.14',
    profile_image: 'https://ui-avatars.com/api/?name=Riyaz+Aly&size=400&background=a855f7&color=fff',
    cover_image: 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=800&h=400&fit=crop',
    bio: 'Dance and lip-sync content creator.',
    tags: ['Dance', 'Lip-sync', 'TikTok', 'Instagram Reels'],
    previous_brands: ['Garnier', 'Myntra', 'Boat'],
    reviews: 623,
    category: 'Music & Dance'
  }
];

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
    return realInfluencersData.filter(inf => inf.category === categoryId);
  } catch (error) {
    console.error('Error fetching influencers by category:', error);
    return [];
  }
};

export const getInfluencersByLocation = async (locationId: string) => {
  try {
    return realInfluencersData.filter(inf => inf.location.includes(locationId));
  } catch (error) {
    console.error('Error fetching influencers by location:', error);
    return [];
  }
};

export const getInfluencerById = async (id: string) => {
  try {
    return realInfluencersData.find(inf => inf.id === id) || null;
  } catch (error) {
    console.error('Error fetching influencer by ID:', error);
    return null;
  }
};

export const getInfluencers = async () => {
  try {
    return [...realInfluencersData];
  } catch (error) {
    console.error('Error fetching influencers:', error);
    return [];
  }
};

export const getAllInfluencers = async (): Promise<User[]> => {
  try {
    const influencers: User[] = realInfluencersData.map(influencer => ({
      uid: influencer.id,
      id: influencer.id,
      email: influencer.email,
      displayName: influencer.name,
      name: influencer.name,
      role: 'Influencer',
      isAdmin: false,
      photoURL: influencer.profile_image,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      bio: influencer.bio,
      niche: influencer.niche,
      followersCount: influencer.followers_count?.toString(),
      referralCount: Math.floor(Math.random() * 50) + 10,
      referralEarnings: Math.floor(Math.random() * 100000) + 5000,
      instagramHandle: influencer.instagram_handle,
      facebookHandle: null,
      isInfluencer: true
    }));
    
    return influencers;
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
