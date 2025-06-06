
import { supabase, testSupabaseConnection } from '@/integrations/supabase/client';

/**
 * Checks if the Supabase connection is working and handles connection errors
 */
export const checkSupabaseConnection = async () => {
  try {
    // Test basic connection
    const result = await testSupabaseConnection();
    
    if (!result.connected) {
      console.error('Supabase connection error:', result.error);
      console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL || 'Not set');
      
      // Log minimal info about the key without exposing it
      const keyInfo = import.meta.env.VITE_SUPABASE_ANON_KEY 
        ? 'Set (length: ' + import.meta.env.VITE_SUPABASE_ANON_KEY.length + ')'
        : 'Not set';
      console.log('Supabase Key status:', keyInfo);
      
      return { 
        connected: false, 
        error: result.error,
        details: 'Check your environment variables and Supabase project settings'
      };
    }
    
    return { connected: true };
  } catch (err) {
    console.error('Error checking Supabase connection:', err);
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return { connected: false, error: errorMessage };
  }
};

export default checkSupabaseConnection;
