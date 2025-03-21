
import { supabase } from '@/integrations/supabase/client';

export const setupSupabase = async (progressCallback?: (progress: number, message: string) => void) => {
  try {
    // Start progress
    progressCallback?.(0, 'Checking Supabase connection...');
    
    // Check connection by making a simple query
    const { error: connectionError } = await supabase.from('users').select('id').limit(1);
    
    if (connectionError) {
      throw new Error(`Failed to connect to Supabase: ${connectionError.message}`);
    }
    
    progressCallback?.(20, 'Supabase connection successful');
    
    // Verify access to tables
    progressCallback?.(30, 'Verifying table access...');
    
    const tables = ['users', 'businesses', 'user_subscriptions', 'subscription_packages'];
    const verifiedTables = [];
    
    for (const [index, table] of tables.entries()) {
      progressCallback?.(30 + (index * 15), `Verifying access to ${table} table...`);
      
      const { error } = await supabase.from(table).select('*').limit(1);
      
      if (error) {
        console.warn(`Warning: Table ${table} access issue: ${error.message}`);
      } else {
        verifiedTables.push(table);
      }
    }
    
    progressCallback?.(100, 'Supabase setup complete');
    
    return {
      success: true,
      tables: verifiedTables,
      error: null
    };
  } catch (error) {
    console.error('Supabase setup error:', error);
    
    return {
      success: false,
      tables: [],
      error: error instanceof Error ? error.message : String(error)
    };
  }
};

// Function to test connection with retry
export const testSupabaseConnection = async (retries = 3, delay = 1000): Promise<boolean> => {
  let attempts = 0;
  
  while (attempts < retries) {
    try {
      const { error } = await supabase.from('users').select('id').limit(1);
      
      if (!error) {
        console.log('Supabase connection successful');
        return true;
      }
      
      console.warn(`Connection attempt ${attempts + 1} failed:`, error.message);
    } catch (error) {
      console.warn(`Connection attempt ${attempts + 1} failed:`, error);
    }
    
    attempts++;
    
    if (attempts < retries) {
      console.log(`Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  console.error(`Failed to connect to Supabase after ${retries} attempts`);
  return false;
};

// Automatically initialize Supabase (for use in components)
export const autoInitSupabase = async (): Promise<boolean> => {
  try {
    // Simple connection test
    const { error } = await supabase.from('users').select('id').limit(1);
    
    if (error) {
      console.warn('Error connecting to Supabase:', error.message);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error initializing Supabase:', error);
    return false;
  }
};
