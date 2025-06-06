
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

// Fetch all businesses
export const fetchBusinesses = async () => {
  try {
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) {
      console.error('Error fetching businesses:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error in fetchBusinesses:', error);
    throw error;
  }
};

// Fetch featured businesses
export const fetchFeaturedBusinesses = async () => {
  try {
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .eq('featured', true)
      .order('name', { ascending: true });
    
    if (error) {
      console.error('Error fetching featured businesses:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error in fetchFeaturedBusinesses:', error);
    throw error;
  }
};

// Fetch businesses by category
export const fetchBusinessesByCategory = async (category: string) => {
  try {
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .eq('category', category)
      .order('name', { ascending: true });
    
    if (error) {
      console.error(`Error fetching businesses by category ${category}:`, error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error(`Error in fetchBusinessesByCategory(${category}):`, error);
    throw error;
  }
};

// Save business
export const saveBusiness = async (businessData: any) => {
  try {
    // Convert tags to array if it's a string
    if (typeof businessData.tags === 'string') {
      businessData.tags = businessData.tags.split(',').map((t: string) => t.trim());
    }
    
    // Determine if this is an update or insert
    const operation = businessData.id ? 'update' : 'insert';
    
    let result;
    
    if (operation === 'update') {
      const { data, error } = await supabase
        .from('businesses')
        .update(businessData)
        .eq('id', businessData.id)
        .select();
      
      if (error) throw error;
      result = data?.[0];
    } else {
      const { data, error } = await supabase
        .from('businesses')
        .insert(businessData)
        .select();
      
      if (error) throw error;
      result = data?.[0];
    }
    
    return result;
  } catch (error) {
    console.error('Error saving business:', error);
    throw error;
  }
};

// Delete business
export const deleteBusiness = async (businessId: number) => {
  try {
    const { error } = await supabase
      .from('businesses')
      .delete()
      .eq('id', businessId);
    
    if (error) {
      console.error('Error deleting business:', error);
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Error in deleteBusiness:', error);
    throw error;
  }
};
