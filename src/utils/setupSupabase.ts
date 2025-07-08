
/**
 * Checks if the Supabase connection is working and handles connection errors
 */
export const checkSupabaseConnection = async () => {
  try {
    // For now, we'll do a basic check by trying to get the current session
    // This is a simple way to test if Supabase is configured correctly
    const { supabase } = await import('@/integrations/supabase/client');
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Supabase connection error:', error);
      console.log('Supabase URL:', 'https://kyjdfhajtdqhdoijzmgk.supabase.co');
      
      return { 
        connected: false, 
        error: error.message,
        details: 'Check your Supabase project settings and configuration'
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
