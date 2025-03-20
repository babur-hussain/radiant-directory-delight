
import { Database } from '@/integrations/supabase/types';

// Type adapter for Supabase database types to our application types
export type SupabaseBusinessRow = Database['public']['Tables']['businesses']['Row'];
export type SupabaseSubscriptionPackageRow = Database['public']['Tables']['subscription_packages']['Row'];
export type SupabaseUserSubscriptionRow = Database['public']['Tables']['user_subscriptions']['Row'];
export type SupabaseUserRow = Database['public']['Tables']['users']['Row'];

// Define insert types as well
export type SupabaseBusinessInsert = Database['public']['Tables']['businesses']['Insert'];
export type SupabaseSubscriptionPackageInsert = Database['public']['Tables']['subscription_packages']['Insert'];
export type SupabaseUserSubscriptionInsert = Database['public']['Tables']['user_subscriptions']['Insert'];
export type SupabaseUserInsert = Database['public']['Tables']['users']['Insert'];

// Define update types
export type SupabaseBusinessUpdate = Database['public']['Tables']['businesses']['Update'];
export type SupabaseSubscriptionPackageUpdate = Database['public']['Tables']['subscription_packages']['Update'];
export type SupabaseUserSubscriptionUpdate = Database['public']['Tables']['user_subscriptions']['Update'];
export type SupabaseUserUpdate = Database['public']['Tables']['users']['Update'];
