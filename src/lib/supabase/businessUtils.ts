
import { supabase } from '@/integrations/supabase/client';
import { IBusiness } from '@/models/Business';

// Convert from Supabase format to our application format
export const fromSupabase = (data: any): IBusiness => {
  return {
    id: data.id,
    name: data.name || '',
    description: data.description || '',
    category: data.category || '',
    address: data.address || '',
    phone: data.phone || '',
    email: data.email || '',
    website: data.website || '',
    image: data.image || '',
    hours: typeof data.hours === 'string' ? JSON.parse(data.hours) : (data.hours || {}),
    rating: data.rating || 0,
    reviews: data.reviews || 0,
    featured: data.featured || false,
    tags: data.tags || [],
    latitude: data.latitude || 0,
    longitude: data.longitude || 0
  };
};

/**
 * Gets businesses from Supabase
 */
export const fetchBusinesses = async (): Promise<IBusiness[]> => {
  try {
    const { data, error } = await supabase
      .from('businesses')
      .select('*');
    
    if (error) throw error;
    return data ? data.map(business => fromSupabase(business)) : [];
  } catch (error) {
    console.error("Error getting businesses:", error);
    return [];
  }
};

/**
 * Creates or updates a business
 */
export const saveBusiness = async (businessData: Partial<IBusiness>): Promise<IBusiness | null> => {
  try {
    if (!businessData.name) {
      throw new Error("Business name is required");
    }
    
    // Prepare the data for Supabase
    const formattedData = {
      name: businessData.name, // Ensure name is included
      description: businessData.description,
      category: businessData.category,
      address: businessData.address,
      phone: businessData.phone,
      email: businessData.email,
      website: businessData.website,
      image: businessData.image,
      hours: businessData.hours ? 
        (typeof businessData.hours === 'string' ? businessData.hours : JSON.stringify(businessData.hours)) 
        : null,
      rating: businessData.rating,
      reviews: businessData.reviews,
      latitude: businessData.latitude,
      longitude: businessData.longitude,
      tags: businessData.tags,
      featured: businessData.featured
    };
    
    const { data, error } = await supabase
      .from('businesses')
      .upsert([formattedData])
      .select();
    
    if (error) throw error;
    return data && data.length > 0 ? fromSupabase(data[0]) : null;
  } catch (error) {
    console.error("Error creating/updating business:", error);
    return null;
  }
};

/**
 * Gets businesses by category
 */
export const fetchBusinessesByCategory = async (category: string): Promise<IBusiness[]> => {
  try {
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .eq('category', category);
    
    if (error) throw error;
    return data ? data.map(business => fromSupabase(business)) : [];
  } catch (error) {
    console.error(`Error getting businesses for category ${category}:`, error);
    return [];
  }
};

/**
 * Gets featured businesses
 */
export const fetchFeaturedBusinesses = async (): Promise<IBusiness[]> => {
  try {
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .eq('featured', true);
    
    if (error) throw error;
    return data ? data.map(business => fromSupabase(business)) : [];
  } catch (error) {
    console.error("Error getting featured businesses:", error);
    return [];
  }
};

/**
 * Deletes a business
 */
export const deleteBusiness = async (id: number | string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('businesses')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error(`Error deleting business with ID ${id}:`, error);
    return false;
  }
};
