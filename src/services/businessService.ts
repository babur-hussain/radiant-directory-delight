
import { supabase } from '@/integrations/supabase/client';

// Fetch all businesses
export const getAllBusinesses = async () => {
  const { data, error } = await supabase
    .from('businesses')
    .select('*')
    .order('name', { ascending: true });
  
  if (error) {
    console.error('Error fetching businesses:', error);
    throw error;
  }
  
  return data || [];
};

// Fetch featured businesses
export const getFeaturedBusinesses = async () => {
  const { data, error } = await supabase
    .from('businesses')
    .select('*')
    .eq('featured', true)
    .order('name', { ascending: true });
  
  if (error) {
    console.error('Error fetching featured businesses:', error);
    throw error;
  }
  
  return data || [];
};

// Fetch businesses by category
export const getBusinessesByCategory = async (category: string) => {
  const { data, error } = await supabase
    .from('businesses')
    .select('*')
    .eq('category', category)
    .order('name', { ascending: true });
  
  if (error) {
    console.error(`Error fetching businesses by category ${category}:`, error);
    throw error;
  }
  
  return data || [];
};

// Get business by ID
export const getBusinessById = async (id: number) => {
  const { data, error } = await supabase
    .from('businesses')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error(`Error fetching business by ID ${id}:`, error);
    throw error;
  }
  
  return data;
};

// Create or update business
export const saveBusiness = async (business: any) => {
  // Convert tags to array if it's a string
  if (typeof business.tags === 'string') {
    business.tags = business.tags.split(',').map((t: string) => t.trim());
  }
  
  if (business.id) {
    // Update existing business
    const { data, error } = await supabase
      .from('businesses')
      .update(business)
      .eq('id', business.id)
      .select();
    
    if (error) {
      console.error('Error updating business:', error);
      throw error;
    }
    
    return data?.[0];
  } else {
    // Create new business
    const { data, error } = await supabase
      .from('businesses')
      .insert(business)
      .select();
    
    if (error) {
      console.error('Error creating business:', error);
      throw error;
    }
    
    return data?.[0];
  }
};

// Delete business
export const deleteBusiness = async (id: number) => {
  const { error } = await supabase
    .from('businesses')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error(`Error deleting business with ID ${id}:`, error);
    throw error;
  }
  
  return true;
};
