
import { supabase } from '@/integrations/supabase/client';

/**
 * Checks if the Supabase connection is working
 */
export const checkSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase.from('users').select('count').limit(1);
    
    if (error) {
      console.error('Supabase connection error:', error);
      return { connected: false, error: error.message };
    }
    
    return { connected: true };
  } catch (err) {
    console.error('Error checking Supabase connection:', err);
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return { connected: false, error: errorMessage };
  }
};

export default checkSupabaseConnection;
