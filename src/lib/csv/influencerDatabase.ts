
import { supabase } from '@/integrations/supabase/client';
import { Influencer, InfluencerBatchSaveResult, SupabaseReadyInfluencer } from './influencerTypes';
import { notifyInfluencerDataChanged, getInfluencersData, setInfluencersData } from './influencerStore';

// Initialize with default data
export const initializeInfluencerData = async () => {
  const { getInfluencerInitialized, setInfluencerInitialized } = await import('./influencerStore');
  if (getInfluencerInitialized()) return;
  
  try {
    // Try to fetch from Supabase
    const { data, error } = await supabase
      .from('influencers')
      .select('*')
      .order('priority', { ascending: false })
      .order('id', { ascending: true });
    
    if (error) {
      throw error;
    }
    
    // Convert the data to match our Influencer interface
    const influencers = data.map(influencer => ({
      ...influencer,
      tags: influencer.tags || [],
      previous_brands: influencer.previous_brands || []
    })) as Influencer[];
    
    setInfluencersData(influencers);
    setInfluencerInitialized(true);
    
  } catch (error) {
    console.error("Error initializing influencer data:", error);
    
    // Dispatch permission error if relevant
    if (error instanceof Error && error.message.includes('permission')) {
      const permissionErrorEvent = new CustomEvent('influencerPermissionError', {
        detail: { message: error.message }
      });
      window.dispatchEvent(permissionErrorEvent);
    }
    
    // Init with empty data as fallback
    setInfluencersData([]);
    setInfluencerInitialized(true);
    throw error;
  }
};

// Delete influencer by ID
export const deleteInfluencer = async (id: number): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('influencers')
      .delete()
      .eq('id', id);
    
    if (error) {
      throw error;
    }
    
    const influencersData = getInfluencersData();
    setInfluencersData(influencersData.filter(influencer => influencer.id !== id));
    notifyInfluencerDataChanged();
    return true;
  } catch (error) {
    console.error("Error deleting influencer:", error);
    return false;
  }
};

// Convert an Influencer object to a format ready for Supabase
const prepareInfluencerForSupabase = (influencer: Influencer): SupabaseReadyInfluencer => {
  const influencerCopy = { ...influencer };
  
  // Remove temporary ID if it's 0 or null
  if ('id' in influencerCopy && (influencerCopy.id === 0 || influencerCopy.id === null)) {
    delete influencerCopy.id;
  }
  
  // Ensure tags is properly handled as an array
  let tagsArray: string[] = [];
  
  if (influencerCopy.tags) {
    if (Array.isArray(influencerCopy.tags)) {
      tagsArray = influencerCopy.tags;
    } else if (typeof influencerCopy.tags === 'string') {
      const tagsString = influencerCopy.tags as string;
      if (tagsString.trim() !== '') {
        tagsArray = tagsString.split(',').map(tag => tag.trim());
      }
    }
  }
  
  // Ensure previous_brands is properly handled as an array
  let brandsArray: string[] = [];
  
  if (influencerCopy.previous_brands) {
    if (Array.isArray(influencerCopy.previous_brands)) {
      brandsArray = influencerCopy.previous_brands;
    } else if (typeof influencerCopy.previous_brands === 'string') {
      const brandsString = influencerCopy.previous_brands as string;
      if (brandsString.trim() !== '') {
        brandsArray = brandsString.split(',').map(brand => brand.trim());
      }
    }
  }
  
  // Remove timestamp fields - let the database handle these
  delete influencerCopy.created_at;
  delete influencerCopy.updated_at;
  
  // Return object formatted for Supabase
  return {
    ...influencerCopy,
    tags: tagsArray,
    previous_brands: brandsArray
  };
};

// Save a batch of influencers to Supabase
export const saveInfluencerBatchToSupabase = async (influencers: Influencer[]): Promise<InfluencerBatchSaveResult> => {
  if (influencers.length === 0) {
    return { success: true, successCount: 0 };
  }

  try {
    let successCount = 0;
    const errors: string[] = [];
    
    // Process influencers individually to handle errors gracefully
    for (const influencer of influencers) {
      try {
        console.log("Saving influencer to Supabase:", influencer.name);
        
        // Prepare the influencer for Supabase
        const preparedInfluencer = prepareInfluencerForSupabase(influencer);
        console.log("Prepared influencer for Supabase:", preparedInfluencer);
        
        const { data, error } = await supabase
          .from('influencers')
          .insert(preparedInfluencer)
          .select();
        
        if (error) {
          console.error("Error inserting influencer to Supabase:", error);
          
          // Handle permission errors more gracefully
          if (error.message && error.message.includes('permission')) {
            errors.push(`Permission error for ${influencer.name}: ${error.message}`);
          } else {
            throw error;
          }
        } else {
          successCount++;
          console.log("Successfully saved influencer to Supabase:", data);
        }
      } catch (err) {
        console.error("Error saving individual influencer:", influencer.name, err);
        errors.push(`Failed to save ${influencer.name}: ${err instanceof Error ? err.message : String(err)}`);
      }
    }
    
    // Return success if at least one influencer was saved
    return { 
      success: successCount > 0, 
      successCount,
      errorMessage: errors.length > 0 ? errors.slice(0, 3).join(", ") + (errors.length > 3 ? ` and ${errors.length - 3} more errors` : '') : undefined
    };
  } catch (error) {
    console.error("Error saving influencer batch to Supabase:", error);
    return { 
      success: false, 
      errorMessage: `Error saving to database: ${error instanceof Error ? error.message : String(error)}`,
      successCount: 0
    };
  }
};
