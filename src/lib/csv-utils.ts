
import { Json } from "@/integrations/supabase/types";
import { supabase } from '@/integrations/supabase/client';

// Define Business interface
export interface Business {
  id: number;
  name: string;
  category: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  image: string;
  hours: string | Record<string, string>;
  rating: number;
  reviews: number;
  featured: boolean;
  tags: string[];
  latitude: number;
  longitude: number;
  created_at: string;
  updated_at: string;
}

// Helper functions for formatting business data
export const parseHours = (hours: string | Record<string, string> | Json | null): Record<string, string> => {
  if (!hours) return {};
  
  if (typeof hours === 'string') {
    try {
      // Try to parse JSON string
      return JSON.parse(hours);
    } catch (error) {
      // If not valid JSON, handle as comma-separated key-value string
      const hoursRecord: Record<string, string> = {};
      const pairs = hours.split(',');
      
      pairs.forEach(pair => {
        const [key, value] = pair.split(':').map(item => item.trim());
        if (key && value) {
          hoursRecord[key] = value;
        }
      });
      
      return hoursRecord;
    }
  }
  
  // Handle already parsed JSON or record
  if (typeof hours === 'object') {
    return hours as Record<string, string>;
  }
  
  return {};
};

// Helper to ensure tags is always an array
export const ensureTagsArray = (tags: string | string[] | null | undefined): string[] => {
  if (!tags) return [];
  
  if (Array.isArray(tags)) {
    return tags;
  }
  
  if (typeof tags === 'string') {
    if (tags.includes(',')) {
      return tags.split(',').map(tag => tag.trim());
    }
    return [tags.trim()];
  }
  
  return [];
};

// Format business data
export const formatBusiness = (business: any): Business => {
  return {
    id: business.id || 0,
    name: business.name || '',
    category: business.category || '',
    description: business.description || '',
    address: business.address || '',
    phone: business.phone || '',
    email: business.email || '',
    website: business.website || '',
    image: business.image || '',
    hours: business.hours || '',
    rating: Number(business.rating) || 0,
    reviews: Number(business.reviews) || 0,
    featured: Boolean(business.featured) || false,
    tags: ensureTagsArray(business.tags),
    latitude: Number(business.latitude) || 0,
    longitude: Number(business.longitude) || 0,
    created_at: business.created_at || '',
    updated_at: business.updated_at || ''
  };
};

// Function to get all businesses
export const getAllBusinesses = async (): Promise<Business[]> => {
  try {
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching businesses:', error);
      return [];
    }
    
    return (data || []).map(formatBusiness);
  } catch (error) {
    console.error('Error in getAllBusinesses:', error);
    return [];
  }
};

// Function to get featured businesses
export const getFeaturedBusinesses = async (limit: number = 6): Promise<Business[]> => {
  try {
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .eq('featured', true)
      .order('rating', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error('Error fetching featured businesses:', error);
      return [];
    }
    
    return (data || []).map(formatBusiness);
  } catch (error) {
    console.error('Error in getFeaturedBusinesses:', error);
    return [];
  }
};

// Function to get businesses by category
export const getBusinessesByCategory = async (category: string): Promise<Business[]> => {
  try {
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .eq('category', category)
      .order('name');
    
    if (error) {
      console.error('Error fetching businesses by category:', error);
      return [];
    }
    
    return (data || []).map(formatBusiness);
  } catch (error) {
    console.error('Error in getBusinessesByCategory:', error);
    return [];
  }
};
