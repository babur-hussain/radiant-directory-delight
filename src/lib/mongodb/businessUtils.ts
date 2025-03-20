
import { supabase } from '@/integrations/supabase/client';
import { SupabaseBusinessRow } from '@/lib/supabase/types';

// Define our application business interface
export interface IBusiness {
  id: number;
  name: string;
  description?: string;
  category?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  image?: string;
  hours: Record<string, any>;
  rating?: number;
  reviews?: number;
  featured?: boolean;
  tags?: string[];
  latitude?: number;
  longitude?: number;
}

// Convert from Supabase format to our application format
const convertBusinessData = (data: SupabaseBusinessRow): IBusiness => {
  return {
    ...data,
    hours: typeof data.hours === 'string' ? JSON.parse(data.hours as string) : data.hours
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
    return data.map(convertBusinessData) as IBusiness[];
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
    // Ensure hours is in the correct format
    const formattedData = {
      ...businessData,
      hours: businessData.hours && typeof businessData.hours !== 'string' 
        ? businessData.hours 
        : businessData.hours
    };
    
    const { data, error } = await supabase
      .from('businesses')
      .upsert(formattedData)
      .select();
    
    if (error) throw error;
    return data?.[0] ? convertBusinessData(data[0] as SupabaseBusinessRow) : null;
  } catch (error) {
    console.error("Error creating/updating business:", error);
    return null;
  }
};
