
export interface Business {
  id: number | string;
  name: string;
  category?: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  image?: string;
  hours?: string | Record<string, string>;
  rating?: number;
  reviews?: number;
  featured?: boolean;
  tags?: string[];
  latitude?: number;
  longitude?: number;
  created_at?: string;
  updated_at?: string;
}

// Helper to ensure tags are always in array format
export const ensureTagsArray = (tags: string[] | string | undefined | null): string[] => {
  if (!tags) return [];
  if (Array.isArray(tags)) return tags;
  if (typeof tags === 'string') {
    if (tags.trim() === '') return [];
    return tags.split(',').map(tag => tag.trim());
  }
  return [];
};

// Helper to convert different ID types to string
export const normalizeBusinessId = (id: string | number | undefined): string => {
  if (id === undefined) return '';
  return id.toString();
};

// Helper to safely parse hours data
export const parseBusinessHours = (hours: any): Record<string, string> | string => {
  if (!hours) return '';
  
  if (typeof hours === 'string') {
    try {
      const parsed = JSON.parse(hours);
      if (typeof parsed === 'object') return parsed;
      return hours;
    } catch (e) {
      return hours;
    }
  }
  
  if (typeof hours === 'object') {
    return hours;
  }
  
  return '';
};

// Convert IBusiness to Business type
export const convertToBusinessType = (business: any): Business => {
  return {
    id: business.id,
    name: business.name || '',
    category: business.category || '',
    description: business.description || '',
    address: business.address || '',
    phone: business.phone || '',
    email: business.email || '',
    website: business.website || '',
    image: business.image || '',
    hours: parseBusinessHours(business.hours),
    rating: business.rating || 0,
    reviews: business.reviews || 0,
    featured: business.featured || false,
    tags: ensureTagsArray(business.tags),
    latitude: business.latitude || 0,
    longitude: business.longitude || 0,
    created_at: business.created_at || '',
    updated_at: business.updated_at || ''
  };
};
