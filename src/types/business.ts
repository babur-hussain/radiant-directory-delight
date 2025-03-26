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
  hours?: string | Record<string, string> | Record<string, any> | any;
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
  if (Array.isArray(tags)) return tags.filter(Boolean);
  if (typeof tags === 'string') {
    if (tags.trim() === '') return [];
    return tags.split(',').map(tag => tag.trim()).filter(Boolean);
  }
  return [];
};

// Helper to convert different ID types to string
export const normalizeBusinessId = (id: string | number | undefined): string => {
  if (id === undefined) return '';
  return id.toString();
};

// Helper to safely parse hours data
export const parseBusinessHours = (hours: any): Record<string, string> | string | any => {
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

// Utility function to convert from Supabase format to our app's Business type
export const mapSupabaseToBusiness = (data: any): Business => {
  let tags: string[] = [];
  
  if (Array.isArray(data.tags)) {
    tags = data.tags.filter(Boolean);
  } else if (typeof data.tags === 'string' && data.tags) {
    try {
      const parsedTags = JSON.parse(data.tags);
      tags = Array.isArray(parsedTags) ? parsedTags.filter(Boolean) : [];
    } catch (e) {
      tags = data.tags.split(',').map((tag: string) => tag.trim()).filter(Boolean);
    }
  }
  
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
    hours: parseBusinessHours(data.hours),
    rating: Number(data.rating) || 0,
    reviews: Number(data.reviews) || 0,
    featured: Boolean(data.featured),
    tags,
    latitude: Number(data.latitude) || 0,
    longitude: Number(data.longitude) || 0,
    created_at: data.created_at || '',
    updated_at: data.updated_at || ''
  };
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

// Create a CSV-utils compatible Business type that makes all fields optional except id and name
export type CsvUtilsBusiness = Omit<Business, 'id'> & { 
  id: number;
  name: string;
  category: string;
  description: string;
};

// Convert from our Business type to csv-utils Business type
export const convertToCsvBusiness = (business: Business): CsvUtilsBusiness => {
  return {
    ...business,
    id: typeof business.id === 'string' ? parseInt(business.id) : (business.id as number),
    name: business.name || '',
    category: business.category || '',
    description: business.description || ''
  } as CsvUtilsBusiness;
};

// Helper for type checking in arguments
export const isNumberId = (id: string | number): boolean => {
  return typeof id === 'number' || !isNaN(parseInt(id as string));
};

// Convert string/number id to number for components expecting number ids
export const toNumberId = (id: string | number): number => {
  return typeof id === 'number' ? id : parseInt(id);
};
