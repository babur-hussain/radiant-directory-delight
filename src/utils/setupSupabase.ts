
import { supabase } from '@/integrations/supabase/client';
import { checkAndInitializeBusinesses } from './businessInitialization';

export interface SetupSupabaseOptions {
  initializeDatabase?: boolean;
  initializeCollections?: boolean;
  clearExistingData?: boolean;
}

export interface SetupSupabaseProgress {
  progress: number;
  message: string;
}

export interface SetupSupabaseResult {
  success: boolean;
  collections: string[];
  error?: string;
}

export const setupSupabase = async (
  progressCallback?: (progress: number, message: string) => void,
  options: SetupSupabaseOptions = {}
): Promise<SetupSupabaseResult> => {
  const { 
    initializeDatabase = true,
    initializeCollections = true,
    clearExistingData = false
  } = options;
  
  try {
    // Check connection
    progressCallback?.(5, "Checking Supabase connection...");
    const { error: connectionError } = await supabase
      .from('users')
      .select('id')
      .limit(1);
    
    if (connectionError) {
      throw new Error(`Failed to connect to Supabase: ${connectionError.message}`);
    }
    
    const collections = ['users', 'businesses', 'subscription_packages', 'user_subscriptions', 'addresses'];
    
    // Check if tables exist
    progressCallback?.(20, "Checking Supabase tables...");
    let existingCollections: string[] = [];
    
    for (const collection of collections) {
      try {
        const { error } = await supabase
          .from(collection)
          .select('*')
          .limit(1);
          
        if (!error) {
          existingCollections.push(collection);
        }
      } catch (error) {
        console.warn(`Table check error for ${collection}:`, error);
      }
    }
    
    progressCallback?.(30, `Found ${existingCollections.length} existing collections`);
    
    // Initialize business data if needed
    progressCallback?.(50, "Initializing business data...");
    const businessResult = await checkAndInitializeBusinesses();
    
    if (businessResult.initialized) {
      progressCallback?.(70, `Initialized ${businessResult.count} businesses`);
    } else {
      progressCallback?.(70, `Found ${businessResult.count} existing businesses`);
    }
    
    // Initialize other collections if needed
    // This would be where you'd add more initialization logic for other collections
    
    progressCallback?.(100, "Supabase setup complete");
    
    return {
      success: true,
      collections: existingCollections
    };
  } catch (error) {
    console.error("Supabase setup error:", error);
    progressCallback?.(0, `Error: ${error instanceof Error ? error.message : String(error)}`);
    
    return {
      success: false,
      collections: [],
      error: error instanceof Error ? error.message : String(error)
    };
  }
};

export default setupSupabase;
