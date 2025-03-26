
import { Database } from '@/integrations/supabase/types';

export interface IBusiness {
  id: number | string;
  name: string;
  description?: string;
  category?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  rating?: number;
  reviews?: number;
  latitude?: number;
  longitude?: number;
  hours?: Record<string, any> | string;
  tags?: string[];
  featured?: boolean;
  image?: string;
}

// Define an adapter function to convert Supabase business data to our application model
export const fromSupabase = (data: Database['public']['Tables']['businesses']['Row']): IBusiness => {
  return {
    id: data.id,
    name: data.name || '',
    description: data.description || '',
    category: data.category || '',
    address: data.address || '',
    phone: data.phone || '',
    email: data.email || '',
    website: data.website || '',
    rating: data.rating || 0,
    reviews: data.reviews || 0,
    latitude: data.latitude || 0,
    longitude: data.longitude || 0,
    hours: typeof data.hours === 'string' ? JSON.parse(data.hours) : (data.hours || {}),
    tags: data.tags || [],
    featured: data.featured || false,
    image: data.image || ''
  };
};
