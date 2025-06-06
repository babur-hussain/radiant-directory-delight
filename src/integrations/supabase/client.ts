import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Use environment variables if available, otherwise use these fallbacks
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://kyjdfhajtdqhdoijzmgk.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5amRmaGFqdGRxaGRvaWp6bWdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI1MDM0MzYsImV4cCI6MjA1ODA3OTQzNn0.c4zxQzkX6UPpTXB8fQUWU_FV0M0jCbEe1ThzDfUYlYY";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
});

// Add a helper function to test the connection
export const testSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase.from('subscription_packages').select('count').limit(1);
    if (error) throw error;
    console.log('Supabase connection successful');
    return { connected: true };
  } catch (error) {
    console.error('Supabase connection error:', error);
    return { 
      connected: false, 
      error: error instanceof Error ? error.message : 'Unknown connection error' 
    };
  }
};
