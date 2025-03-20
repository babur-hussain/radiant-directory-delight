// Add type conversion to handle the Json type
interface IBusiness {
  id: number;
  name: string;
  // ... other business fields
  hours: Record<string, any>;
  // ... other remaining fields
}

// Update the function to convert Json string to object if needed
const convertBusinessData = (data: any): IBusiness => {
  return {
    ...data,
    hours: typeof data.hours === 'string' ? JSON.parse(data.hours) : data.hours
  };
};

import { supabase } from '@/integrations/supabase/client';

/**
 * Gets businesses from Supabase
 */
export const fetchBusinesses = async (): Promise<IBusiness[]> => {
  try {
    const { data, error } = await supabase
      .from('businesses')
      .select('*');
    
    if (error) throw error;
    return data.map(convertBusinessData) as IBusiness[];
  } catch (error) {
    console.error("Error getting businesses:", error);
    return [];
  }
}

/**
 * Creates or updates a business
 */
export const saveBusiness = async (businessData: any): Promise<any | null> => {
  try {
    const { data, error } = await supabase
      .from('businesses')
      .upsert(businessData)
      .select();
    
    if (error) throw error;
    return data?.[0] || null;
  } catch (error) {
    console.error("Error creating/updating business:", error);
    return null;
  }
}
