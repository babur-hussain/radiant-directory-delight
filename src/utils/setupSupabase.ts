
import { supabase } from '@/integrations/supabase/client';

// Check if database is initialized
export const isDatabaseInitialized = async (): Promise<boolean> => {
  try {
    // Try to select from the users table
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error('Error checking database initialization:', error);
      return false;
    }
    
    // If we can select from the users table, assume the database is initialized
    return true;
  } catch (error) {
    console.error('Error checking database initialization:', error);
    return false;
  }
};

// Initialize database tables and data
export const initializeDatabase = async (): Promise<boolean> => {
  try {
    console.log('Initializing database...');
    
    // Check if tables exist by trying to query them
    const tableNames = ['users', 'businesses', 'subscription_packages', 'user_subscriptions'];
    let allTablesExist = true;
    
    for (const tableName of tableNames) {
      const { error } = await supabase
        .from(tableName as any)
        .select('count')
        .limit(1);
      
      if (error) {
        console.error(`Table '${tableName}' does not exist or is not accessible:`, error);
        allTablesExist = false;
        break;
      }
    }
    
    if (allTablesExist) {
      console.log('Database already initialized');
      return true;
    }
    
    // If tables don't exist, we would normally create them
    // But in this case, with Supabase we're assuming tables are created via SQL migrations
    console.error('One or more tables do not exist in the database. Please run migrations.');
    return false;
  } catch (error) {
    console.error('Error initializing database:', error);
    return false;
  }
};

// Setup function to be called on app initialization
export const setupSupabase = async (): Promise<boolean> => {
  try {
    const initialized = await isDatabaseInitialized();
    
    if (!initialized) {
      console.log('Database not initialized, attempting to initialize...');
      return await initializeDatabase();
    }
    
    return true;
  } catch (error) {
    console.error('Error setting up Supabase:', error);
    return false;
  }
};

export default setupSupabase;
