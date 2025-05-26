
export interface Influencer {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  bio?: string;
  niche?: string;
  followers_count?: number;
  engagement_rate?: number;
  location?: string;
  city?: string;
  state?: string;
  country?: string;
  instagram_handle?: string;
  youtube_handle?: string;
  tiktok_handle?: string;
  facebook_handle?: string;
  twitter_handle?: string;
  linkedin_handle?: string;
  website?: string;
  profile_image?: string;
  cover_image?: string;
  rating?: number;
  reviews?: number;
  featured?: boolean;
  priority?: number;
  tags?: string[];
  previous_brands?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface InfluencerCsvProcessingResult {
  success: boolean;
  influencers: Influencer[];
  message: string;
}

export interface InfluencerBatchSaveResult {
  success: boolean;
  errorMessage?: string;
  successCount: number;
}

export interface InfluencerProcessingResult {
  success: boolean;
  influencer?: Influencer;
  errorMessage?: string;
}

export interface SupabaseReadyInfluencer {
  id?: number;
  name: string;
  email?: string;
  phone?: string;
  bio?: string;
  niche?: string;
  followers_count?: number;
  engagement_rate?: number;
  location?: string;
  city?: string;
  state?: string;
  country?: string;
  instagram_handle?: string;
  youtube_handle?: string;
  tiktok_handle?: string;
  facebook_handle?: string;
  twitter_handle?: string;
  linkedin_handle?: string;
  website?: string;
  profile_image?: string;
  cover_image?: string;
  rating?: number;
  reviews?: number;
  featured?: boolean;
  priority?: number;
  tags?: string[];
  previous_brands?: string[];
}
