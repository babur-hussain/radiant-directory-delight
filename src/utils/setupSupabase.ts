import { supabase } from '@/integrations/supabase/client';

interface SetupSupabaseResult {
  success: boolean;
  message?: string;
}

export const setupSupabase = async (): Promise<SetupSupabaseResult> => {
  try {
    // Check if Supabase is running
    const { data: profiles, error: profilesError } = await supabase
      .from('users')
      .select('*')
      .limit(1);
    
    if (profilesError) {
      console.error("Error connecting to Supabase:", profilesError);
      return {
        success: false,
        message: `Failed to connect to Supabase: ${profilesError.message}`
      };
    }
    
    // Check if tables exist
    const tables = ['users', 'businesses', 'subscription_packages', 'user_subscriptions', 'addresses'];
    const missingTables = [];
    
    for (const table of tables) {
      // Use proper table typing for Supabase
      const { count, error } = await supabase
        .from(table as any)
        .select('*', { count: 'exact', head: true });
      
      if (error || count === null) {
        missingTables.push(table);
      }
    }
    
    if (missingTables.length > 0) {
      console.warn("Missing tables:", missingTables);
      return {
        success: false,
        message: `Missing tables in Supabase: ${missingTables.join(', ')}`
      };
    }
    
    console.log("Supabase setup check completed successfully");
    return {
      success: true,
      message: "Supabase setup check completed successfully"
    };
  } catch (error: any) {
    console.error("Error during Supabase setup check:", error);
    return {
      success: false,
      message: `An unexpected error occurred: ${error.message}`
    };
  }
};

export default setupSupabase;
