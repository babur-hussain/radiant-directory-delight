
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
    return data.map(business => fromSupabase(business));
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
    
    // Ensure hours is in the correct format
    const formattedData = {
      ...businessData,
      hours: businessData.hours ? 
        (typeof businessData.hours === 'string' ? businessData.hours : JSON.stringify(businessData.hours)) 
        : null
    };
    
    const { data, error } = await supabase
      .from('businesses')
      .upsert([formattedData])
      .select();
    
    if (error) throw error;
    return data?.[0] ? fromSupabase(data[0]) : null;
  } catch (error) {
    console.error("Error creating/updating business:", error);
    return null;
  }
};
