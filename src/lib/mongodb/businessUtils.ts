
import { supabase } from '@/integrations/supabase/client';
import { IBusiness } from '@/models/Business';

// Convert from Supabase format to our application format
const convertBusinessData = (data: any): IBusiness => {
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
    return data ? data.map(convertBusinessData) : [];
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
    // Ensure required fields
    if (!businessData.name) {
      throw new Error("Business name is required");
    }
    
    // Ensure hours is in the correct format
    const formattedData = {
      ...businessData,
      name: businessData.name, // Explicitly include name since it's required
      hours: businessData.hours ? 
        (typeof businessData.hours === 'string' ? businessData.hours : JSON.stringify(businessData.hours)) 
        : null
    };
    
    const { data, error } = await supabase
      .from('businesses')
      .upsert([formattedData])
      .select();
    
    if (error) throw error;
    return data && data.length > 0 ? convertBusinessData(data[0]) : null;
  } catch (error) {
    console.error("Error creating/updating business:", error);
    return null;
  }
};
