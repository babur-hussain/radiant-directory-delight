
import { Json } from './supabase';

export interface Business {
  id: number;
  name: string;
  category?: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  image?: string;
  hours?: Record<string, string> | string | null;
  rating: number;
  reviews: number;
  featured?: boolean;
  tags: string[];
  latitude?: number;
  longitude?: number;
  created_at?: string;
  updated_at?: string;
}

// Helper function to ensure tags are always an array
export const ensureTagsArray = (tags: string | string[] | null | undefined): string[] => {
  if (!tags) return [];
  if (Array.isArray(tags)) return tags;
  return tags.split(',').map(tag => tag.trim());
};

// Helper function to safely parse hours
export const parseHours = (hours: Json | null): Record<string, string> | null => {
  if (!hours) return null;
  
  try {
    if (typeof hours === 'string') {
      return JSON.parse(hours) as Record<string, string>;
    } else if (typeof hours === 'object') {
      return hours as Record<string, string>;
    }
  } catch (e) {
    console.error('Error parsing hours:', e);
  }
  
  return null;
};

// Convert database response to Business type
export const formatBusiness = (data: any): Business => {
  return {
    id: data.id,
    name: data.name || '',
    category: data.category || '',
    description: data.description || '',
    address: data.address || '',
    phone: data.phone || '',
    email: data.email || '',
    website: data.website || '',
    image: data.image || '',
    hours: parseHours(data.hours),
    rating: Number(data.rating) || 0,
    reviews: Number(data.reviews) || 0,
    featured: Boolean(data.featured),
    tags: ensureTagsArray(data.tags),
    latitude: data.latitude || 0,
    longitude: data.longitude || 0,
    created_at: data.created_at,
    updated_at: data.updated_at
  };
};
