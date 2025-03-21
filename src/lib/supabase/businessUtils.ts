
import { supabase } from '@/integrations/supabase/client';
import { IBusiness, fromSupabase } from '@/models/Business';

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
