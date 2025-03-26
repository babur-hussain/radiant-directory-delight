
import { supabase } from '@/integrations/supabase/client';
import { Business, BatchSaveResult } from './types';
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
      // Ensure hours is converted from JSON string or Json type to Record<string, any>
      hours: business.hours ? 
        (typeof business.hours === 'string' ? 
          JSON.parse(business.hours) : 
          (typeof business.hours === 'object' ? business.hours : {})
        ) : {},
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
        
        // Clone the business and prepare it for saving
        const businessToSave = { ...business };
        
        // Remove the temporary ID before saving to let the database set it
        if ('id' in businessToSave && (businessToSave.id === 0 || businessToSave.id === null)) {
          delete businessToSave.id;
        }
        
        // Handle the hours field properly for database storage
        let hoursForDB: string;
        if (businessToSave.hours) {
          if (typeof businessToSave.hours === 'object') {
            hoursForDB = JSON.stringify(businessToSave.hours);
          } else if (typeof businessToSave.hours === 'string') {
            // If it's already a string, use it as is
            hoursForDB = businessToSave.hours;
          } else {
            hoursForDB = JSON.stringify({});
          }
        } else {
          hoursForDB = JSON.stringify({});
        }
        
        // Create a clean object for Supabase
        const preparedBusiness = {
          ...businessToSave,
          hours: hoursForDB
        };
        
        // Always remove timestamp fields - let the database handle these
        if ('created_at' in preparedBusiness) {
          delete preparedBusiness.created_at;
        }
        
        if ('updated_at' in preparedBusiness) {
          delete preparedBusiness.updated_at;
        }
        
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
