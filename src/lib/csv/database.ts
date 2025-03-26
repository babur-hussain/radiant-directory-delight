
import { supabase } from '@/integrations/supabase/client';
import { Business, BatchSaveResult, SupabaseReadyBusiness } from './types';
import { notifyDataChanged, getBusinessesData, setBusinessesData } from './store';
import { toast } from '@/hooks/use-toast';

// Initialize with default data
export const initializeData = async () => {
  const { getInitialized, setInitialized } = await import('./store');
  if (getInitialized()) return;
  
  try {
    // Try to fetch from Supabase
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .order('id', { ascending: true });
    
    if (error) {
      throw error;
    }
    
    // Convert the data to match our Business interface
    const businesses = data.map(business => ({
      ...business,
      // Ensure hours is properly converted from jsonb
      hours: business.hours || {},
      // Ensure tags is an array
      tags: business.tags || []
    })) as Business[];
    
    setBusinessesData(businesses);
    setInitialized(true);
    
  } catch (error) {
    console.error("Error initializing data:", error);
    
    // Dispatch permission error if relevant
    if (error instanceof Error && error.message.includes('permission')) {
      const permissionErrorEvent = new CustomEvent('businessPermissionError', {
        detail: { message: error.message }
      });
      window.dispatchEvent(permissionErrorEvent);
    }
    
    // Init with empty data as fallback
    setBusinessesData([]);
    setInitialized(true);
    throw error;
  }
};

// Delete business by ID
export const deleteBusiness = async (id: number): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('businesses')
      .delete()
      .eq('id', id);
    
    if (error) {
      throw error;
    }
    
    const businessesData = getBusinessesData();
    setBusinessesData(businessesData.filter(business => business.id !== id));
    notifyDataChanged();
    return true;
  } catch (error) {
    console.error("Error deleting business:", error);
    return false;
  }
};

// Convert a Business object to a format ready for Supabase
const prepareBusinessForSupabase = (business: Business): SupabaseReadyBusiness => {
  // Make a shallow copy of the business
  const businessCopy = { ...business };
  
  // Remove temporary ID if it's 0 or null
  if ('id' in businessCopy && (businessCopy.id === 0 || businessCopy.id === null)) {
    delete businessCopy.id;
  }
  
  // Process hours - convert to JSON string if it's an object
  let hoursForDB = {};
  if (businessCopy.hours) {
    if (typeof businessCopy.hours === 'object') {
      hoursForDB = businessCopy.hours;
    } else if (typeof businessCopy.hours === 'string') {
      // If it's already a string, validate it as JSON
      try {
        hoursForDB = JSON.parse(businessCopy.hours);
      } catch (e) {
        // If parsing fails, use empty object
        hoursForDB = {};
      }
    }
  }
  
  // Ensure tags is properly handled as an array
  let tagsArray: string[] = [];
  
  if (businessCopy.tags) {
    // Check that tags is actually an array or a string before processing
    if (Array.isArray(businessCopy.tags)) {
      tagsArray = businessCopy.tags;
    } else if (typeof businessCopy.tags === 'string') {
      // We need to explicitly cast to string to satisfy TypeScript
      const tagsString = businessCopy.tags as string;
      tagsArray = tagsString.split(',').map(tag => tag.trim());
    } else {
      // Handle other cases, just use empty array
      console.warn('Unknown tags type encountered:', typeof businessCopy.tags);
    }
  }
  
  // Remove timestamp fields - let the database handle these
  delete businessCopy.created_at;
  delete businessCopy.updated_at;
  
  // Return object formatted for Supabase
  return {
    ...businessCopy,
    hours: hoursForDB,
    tags: tagsArray
  };
};

// Save a batch of businesses to Supabase
export const saveBatchToSupabase = async (businesses: Business[]): Promise<BatchSaveResult> => {
  if (businesses.length === 0) {
    return { success: true, successCount: 0 };
  }

  try {
    let successCount = 0;
    const errors: string[] = [];
    
    // Process businesses individually to handle errors gracefully
    for (const business of businesses) {
      try {
        console.log("Saving business to Supabase:", business.name);
        
        // Prepare the business for Supabase
        const preparedBusiness = prepareBusinessForSupabase(business);
        console.log("Prepared business for Supabase:", preparedBusiness);
        
        const { data, error } = await supabase
          .from('businesses')
          .insert(preparedBusiness)
          .select();
        
        if (error) {
          console.error("Error inserting business to Supabase:", error);
          
          // Handle permission errors more gracefully
          if (error.message && error.message.includes('permission')) {
            // Instead of throwing, just add to errors and continue
            errors.push(`Permission error for ${business.name}: ${error.message}`);
          } else {
            throw error;
          }
        } else {
          successCount++;
          console.log("Successfully saved business to Supabase:", data);
        }
      } catch (err) {
        console.error("Error saving individual business:", business.name, err);
        errors.push(`Failed to save ${business.name}: ${err instanceof Error ? err.message : String(err)}`);
      }
    }
    
    // Return success if at least one business was saved
    return { 
      success: successCount > 0, 
      successCount,
      errorMessage: errors.length > 0 ? errors.slice(0, 3).join(", ") + (errors.length > 3 ? ` and ${errors.length - 3} more errors` : '') : undefined
    };
  } catch (error) {
    console.error("Error saving batch to Supabase:", error);
    return { 
      success: false, 
      errorMessage: `Error saving to database: ${error instanceof Error ? error.message : String(error)}`,
      successCount: 0
    };
  }
};
