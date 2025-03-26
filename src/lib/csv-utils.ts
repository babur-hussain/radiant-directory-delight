import { Json } from "@/integrations/supabase/types";
import { supabase } from '@/integrations/supabase/client';
import Papa from 'papaparse';

// Define Business interface
export interface Business {
  id: number | string; // Allow both number and string IDs
  name: string;
  category: string; // Changed from optional to required to match the other Business type
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  image?: string;
  hours?: string | Record<string, string> | Record<string, any>;
  rating?: number;
  reviews?: number;
  featured?: boolean;
  tags?: string[];
  latitude?: number;
  longitude?: number;
  created_at?: string;
  updated_at?: string;
}

// Function to parse CSV file and convert it to Business objects
export const parseBusinessesCSV = async (file: File): Promise<Business[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const businesses: Business[] = results.data.map((row: any, index: number) => {
            // Skip rows without a business name (required field)
            if (!row["Business Name"] && !row.name) {
              return null;
            }
            
            // Generate a unique ID for each business (negative to avoid conflicts with DB IDs)
            const id = -(index + 1);
            
            // Parse tags from comma-separated string
            const tags = row.Tags ? 
              row.Tags.split(',').map((tag: string) => tag.trim()) : 
              [];
            
            // Generate a default image URL if none provided
            const categoryValue = row.Category || row.category || "";
            const image = row.Image || row.image || `https://source.unsplash.com/random/500x350/?${categoryValue.toLowerCase().replace(/\s+/g, ",")}`;
            
            // Parse rating as a number (0 if invalid)
            const rating = parseFloat(row.Review || row.Rating || row.rating || "0");
            
            // Current timestamp for created_at and updated_at
            const timestamp = new Date().toISOString();
            
            return {
              id,
              name: row["Business Name"] || row.name || "",
              category: row.Category || row.category || "",
              description: row.Description || row.description || "",
              address: row.Address || row.address || "",
              phone: row["Mobile Number"] || row.Phone || row.phone || "",
              email: row.Email || row.email || "",
              website: row.Website || row.website || "",
              image,
              hours: row.Hours || row.hours || {},
              rating: isNaN(rating) ? 0 : rating,
              reviews: parseInt(row.Reviews || row.reviews || "0", 10) || 0,
              featured: row.Featured === "true" || row.Featured === true || false,
              tags,
              latitude: parseFloat(row.Latitude || row.latitude || "0") || 0,
              longitude: parseFloat(row.Longitude || row.longitude || "0") || 0,
              created_at: timestamp,
              updated_at: timestamp
            };
          }).filter(Boolean); // Remove null entries (rows without business name)
          
          resolve(businesses);
        } catch (error) {
          reject(error);
        }
      },
      error: (error) => {
        reject(error);
      }
    });
  });
};

// Cache for businesses to avoid repeated fetches
let businessesCache: Business[] | null = null;
let featuredBusinessesCache: Business[] | null = null;
let lastFetchTimestamp = 0;
const CACHE_VALIDITY_MS = 5 * 60 * 1000; // 5 minutes

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
    category: business.category || '', // Ensure category is never undefined
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

// Function to get all businesses with caching
export const getAllBusinesses = async (): Promise<Business[]> => {
  const now = Date.now();
  
  // Return cached data if it's still valid
  if (businessesCache && (now - lastFetchTimestamp < CACHE_VALIDITY_MS)) {
    console.log('Using cached businesses data');
    return businessesCache;
  }
  
  try {
    console.log('Fetching businesses from Supabase');
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching businesses:', error);
      return businessesCache || []; // Return cached data if available, otherwise empty array
    }
    
    // Update cache
    businessesCache = (data || []).map(formatBusiness);
    lastFetchTimestamp = now;
    
    return businessesCache;
  } catch (error) {
    console.error('Error in getAllBusinesses:', error);
    return businessesCache || []; // Return cached data if available, otherwise empty array
  }
};

// Function to get featured businesses with caching
export const getFeaturedBusinesses = async (limit: number = 6): Promise<Business[]> => {
  const now = Date.now();
  
  // Return cached data if it's still valid
  if (featuredBusinessesCache && (now - lastFetchTimestamp < CACHE_VALIDITY_MS)) {
    console.log('Using cached featured businesses data');
    return featuredBusinessesCache;
  }
  
  try {
    console.log('Fetching featured businesses from Supabase');
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .eq('featured', true)
      .order('rating', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error('Error fetching featured businesses:', error);
      return featuredBusinessesCache || []; // Return cached data if available, otherwise empty array
    }
    
    // Update cache
    featuredBusinessesCache = (data || []).map(formatBusiness);
    lastFetchTimestamp = now;
    
    return featuredBusinessesCache;
  } catch (error) {
    console.error('Error in getFeaturedBusinesses:', error);
    return featuredBusinessesCache || []; // Return cached data if available, otherwise empty array
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

// Add listeners for data changes
const dataChangeListeners: Array<() => void> = [];

export const addDataChangeListener = (listener: () => void) => {
  dataChangeListeners.push(listener);
};

export const removeDataChangeListener = (listener: () => void) => {
  const index = dataChangeListeners.indexOf(listener);
  if (index !== -1) {
    dataChangeListeners.splice(index, 1);
  }
};

// Notify listeners about data changes
const notifyDataChange = () => {
  dataChangeListeners.forEach(listener => listener());
};

// Function to initialize data
export const initializeData = async (): Promise<void> => {
  console.log("Initializing business data...");
  
  // Pre-fetch data for caching
  if (!businessesCache) {
    try {
      await getAllBusinesses();
      console.log("Businesses data initialized and cached");
    } catch (err) {
      console.error("Error initializing business data:", err);
    }
  }
  
  notifyDataChange();
  return Promise.resolve();
};

// Function to delete a business
export const deleteBusiness = async (id: number): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('businesses')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    // Invalidate cache to force refresh
    businessesCache = null;
    featuredBusinessesCache = null;
    
    notifyDataChange();
    return true;
  } catch (error) {
    console.error('Error deleting business:', error);
    return false;
  }
};
