
import { supabase, testSupabaseConnection } from '@/integrations/supabase/client';

/**
 * Checks if the Supabase connection is working
 */
export const checkSupabaseConnection = async () => {
  try {
    // Use the dedicated test function
    const result = await testSupabaseConnection();
    
    if (!result.connected) {
      console.error('Supabase connection error:', result.error);
      return { connected: false, error: result.error };
    }
    
    return { connected: true };
  } catch (err) {
    console.error('Error checking Supabase connection:', err);
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return { connected: false, error: errorMessage };
  }
};

export default checkSupabaseConnection;
