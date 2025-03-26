
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
      name: businessData.name,
      description: businessData.description || '',
      category: businessData.category || '',
      address: businessData.address || '',
      phone: businessData.phone || '',
      email: businessData.email || '',
      website: businessData.website || '',
      image: businessData.image || '',
      hours: businessData.hours ? 
        (typeof businessData.hours === 'string' ? businessData.hours : JSON.stringify(businessData.hours)) 
        : null,
      rating: businessData.rating || 0,
      reviews: businessData.reviews || 0,
      latitude: businessData.latitude || 0,
      longitude: businessData.longitude || 0,
      tags: businessData.tags || [],
      featured: businessData.featured || false
    };
    
    // Handle id differently if it's a string
    if (businessData.id !== undefined) {
      // If ID is a string that can be converted to a number, do so
      if (typeof businessData.id === 'string' && !isNaN(Number(businessData.id))) {
        formattedData['id'] = Number(businessData.id);
      } else if (typeof businessData.id === 'number') {
        formattedData['id'] = businessData.id;
      }
      // If id is a non-numeric string, we don't include it (let Supabase generate it)
    }
    
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
